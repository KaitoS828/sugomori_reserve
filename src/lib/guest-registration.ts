// 宿泊者名簿（旅館業法）の記入まわり。
// 予約ごとに推測できない secret_code を1つ持たせ、その URL でフォームを開く。
// lookup_token は Web 予約にしか入らないため、手動予約でも使えるこちらを使う。

import crypto from "crypto";
import type { createAdminClient } from "./supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export function newSecretCode(): string {
  // URL に載るので記号を含まない形にする
  return crypto.randomBytes(16).toString("hex");
}

/** 予約の secret_code を返す。無ければ作る。 */
export async function ensureSecretCode(
  supabase: AdminClient,
  reservationId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("reservation_checkins")
    .select("secret_code")
    .eq("reservation_id", reservationId)
    .maybeSingle();
  if (existing?.secret_code) return existing.secret_code as string;

  const secret = newSecretCode();
  const { error } = await supabase
    .from("reservation_checkins")
    .insert({ reservation_id: reservationId, secret_code: secret });
  if (error) {
    // 同時に作られた場合は相手の値を使う
    const { data: retry } = await supabase
      .from("reservation_checkins")
      .select("secret_code")
      .eq("reservation_id", reservationId)
      .maybeSingle();
    return (retry?.secret_code as string | undefined) ?? null;
  }
  return secret;
}

/**
 * 複数予約ぶんの secret_code を一括で用意する。予約一覧画面で予約ごとに
 * ensureSecretCode を直列/並列に呼ぶとDB往復がO(件数)になり体感が重くなるため、
 * まとめて1〜2回のクエリで済ませる。
 */
export async function ensureSecretCodes(
  supabase: AdminClient,
  reservationIds: string[],
): Promise<Map<string, string>> {
  if (reservationIds.length === 0) return new Map();

  const { data: existing } = await supabase
    .from("reservation_checkins")
    .select("reservation_id, secret_code")
    .in("reservation_id", reservationIds);

  const map = new Map<string, string>(
    ((existing ?? []) as { reservation_id: string; secret_code: string }[]).map((r) => [
      r.reservation_id,
      r.secret_code,
    ]),
  );

  const missing = reservationIds.filter((id) => !map.has(id));
  if (missing.length > 0) {
    const rows = missing.map((reservation_id) => ({ reservation_id, secret_code: newSecretCode() }));
    const { data: inserted, error } = await supabase
      .from("reservation_checkins")
      .insert(rows)
      .select("reservation_id, secret_code");
    if (!error) {
      for (const r of (inserted ?? []) as { reservation_id: string; secret_code: string }[]) {
        map.set(r.reservation_id, r.secret_code);
      }
    } else {
      // 同時実行などで衝突した場合は改めて読み直す
      const { data: retry } = await supabase
        .from("reservation_checkins")
        .select("reservation_id, secret_code")
        .in("reservation_id", missing);
      for (const r of (retry ?? []) as { reservation_id: string; secret_code: string }[]) {
        map.set(r.reservation_id, r.secret_code);
      }
    }
  }

  return map;
}

export function registerUrl(origin: string, secretCode: string | null): string | null {
  return secretCode ? `${origin.replace(/\/$/, "")}/register/${secretCode}` : null;
}
