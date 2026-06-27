import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReservationWithRefs } from "@/types/db";

export const dynamic = "force-dynamic";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const custName = (c: ReservationWithRefs["customers"]) =>
  c ? [c.last_name, c.first_name].filter(Boolean).join(" ") || "（無名）" : "—";

function CustomerDetail({ r }: { r: ReservationWithRefs }) {
  const c = r.customers;
  if (!c) return null;
  return (
    <div className="mb-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-gray-400">氏名（カナ）</dt>
          <dd className="text-gray-800">{[c.last_name_kana, c.first_name_kana].filter(Boolean).join(" ") || "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-gray-400">電話</dt>
          <dd>{c.phone ? <a href={`tel:${c.phone}`} className="text-cyan-600 hover:underline">{c.phone}</a> : "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-gray-400">メール</dt>
          <dd>{c.email ? <a href={`mailto:${c.email}`} className="text-cyan-600 hover:underline">{c.email}</a> : "—"}</dd>
        </div>
        {r.check_in_time && (
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-400">到着予定</dt>
            <dd className="text-gray-800">{r.check_in_time}</dd>
          </div>
        )}
        <div className="flex gap-2 md:col-span-2">
          <dt className="w-24 shrink-0 text-gray-400">住所</dt>
          <dd className="text-gray-800">{[c.prefecture, c.city, c.address, c.building].filter(Boolean).join(" ") || "—"}</dd>
        </div>
        {r.survey && (
          <div className="flex gap-2 md:col-span-2">
            <dt className="w-24 shrink-0 text-gray-400">ご要望</dt>
            <dd className="whitespace-pre-wrap text-gray-800">{r.survey}</dd>
          </div>
        )}
        {r.note && (
          <div className="flex gap-2 md:col-span-2">
            <dt className="w-24 shrink-0 text-gray-400">その他連絡</dt>
            <dd className="whitespace-pre-wrap text-gray-800">{r.note}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export default async function DashboardPage() {
  const today = todayStr();
  const supabase = createAdminClient();

  const sel = "*, customers(id,last_name,first_name,last_name_kana,first_name_kana,email,phone,prefecture,city,address,building), room_types(id,name), rooms(id,name), plans(id,name)";
  const [checkInsRes, checkOutsRes, openInquiriesRes, upcomingRes] = await Promise.all([
    supabase
      .from("reservations")
      .select(sel)
      .eq("check_in", today)
      .in("status", ["pending", "confirmed", "checked_in"])
      .order("created_at"),
    supabase
      .from("reservations")
      .select(sel)
      .eq("check_out", today)
      .in("status", ["confirmed", "checked_in", "checked_out"])
      .order("created_at"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("reservations")
      .select(sel)
      .gte("check_in", today)
      .in("status", ["pending", "confirmed"])
      .order("check_in")
      .limit(20),
  ]);

  const checkIns = (checkInsRes.data ?? []) as ReservationWithRefs[];
  const checkOuts = (checkOutsRes.data ?? []) as ReservationWithRefs[];
  const upcoming = (upcomingRes.data ?? []) as ReservationWithRefs[];
  const revenue = checkIns.reduce((s, r) => s + (r.amount ?? 0), 0);

  const cards = [
    { label: "本日チェックイン", value: `${checkIns.length}件`, href: "/admin/reservations" },
    { label: "本日チェックアウト", value: `${checkOuts.length}件`, href: "/admin/reservations" },
    { label: "本日チェックイン分の売上", value: `¥${revenue.toLocaleString()}`, href: "/admin/payments" },
    { label: "未対応の問合せ", value: `${openInquiriesRes.count ?? 0}件`, href: "/admin/reservations" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">{today}</p>
        </div>
        <Link href="/admin/reservations" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
          ＋ 予約を登録
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-500">{c.value}</p>
          </Link>
        ))}
      </section>

      {/* 予定しているチェックイン */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">予定しているチェックイン</h2>
          <Link href="/admin/calendar" className="text-xs text-cyan-500 hover:underline">カレンダーで見る →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">今後の予約はありません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcoming.map((r) => (
              <li key={r.id}>
                <details className="group">
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 py-2.5 text-sm list-none">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-cyan-50 px-2 py-1 font-mono text-xs text-cyan-600">{r.check_in}</span>
                      <span className="font-medium text-gray-800">{custName(r.customers)}</span>
                      {r.status === "pending" && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">仮予約</span>
                      )}
                    </div>
                    <span className="flex items-center gap-3 text-gray-500">
                      {r.nights}泊 / {r.num_guests}名 / {r.plans?.name ?? "—"}
                      {r.rooms ? ` / ${r.rooms.name}` : ""}
                      <Link href={`/admin/calendar?month=${r.check_in.slice(0,7)}&selected=${r.id}`} className="text-xs text-cyan-500 hover:underline">詳細</Link>
                      <span className="text-xs text-cyan-400 group-open:hidden">▼</span>
                      <span className="text-xs text-cyan-400 hidden group-open:inline">▲</span>
                    </span>
                  </summary>
                  {r.customers && <CustomerDetail r={r} />}
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-medium text-gray-900">本日チェックイン</h2>
          {checkIns.length === 0 ? (
            <p className="text-sm text-gray-400">予定なし</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {checkIns.map((r) => (
                <li key={r.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 text-sm list-none">
                      <span className="font-medium text-gray-800">{custName(r.customers)}</span>
                      <span className="text-gray-500">
                        {r.room_types?.name ?? "—"}{r.rooms ? ` ${r.rooms.name}` : ""} / {r.num_guests}名
                        <span className="ml-2 text-xs text-cyan-400 group-open:hidden">▼</span>
                        <span className="ml-2 text-xs text-cyan-400 hidden group-open:inline">▲</span>
                      </span>
                    </summary>
                    {r.customers && <CustomerDetail r={r} />}
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-medium text-gray-900">本日チェックアウト</h2>
          {checkOuts.length === 0 ? (
            <p className="text-sm text-gray-400">予定なし</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {checkOuts.map((r) => (
                <li key={r.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 py-2 text-sm list-none">
                      <span className="font-medium text-gray-800">{custName(r.customers)}</span>
                      <span className="text-gray-500">
                        {r.room_types?.name ?? "—"}{r.rooms ? ` ${r.rooms.name}` : ""}
                        <span className="ml-2 text-xs text-cyan-400 group-open:hidden">▼</span>
                        <span className="ml-2 text-xs text-cyan-400 hidden group-open:inline">▲</span>
                      </span>
                    </summary>
                    {r.customers && <CustomerDetail r={r} />}
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
