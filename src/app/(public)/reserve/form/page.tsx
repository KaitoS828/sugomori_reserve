import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calcPrice, type Discount } from "@/lib/pricing";
import { eachNight } from "@/lib/availability";
import { startCheckout } from "./actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#d46a2a]";
const label = "text-sm font-medium text-gray-900";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS = ["00", "15", "30", "45"];

type CustomerProfile = {
  last_name: string | null;
  first_name: string | null;
  last_name_kana: string | null;
  first_name_kana: string | null;
  email: string | null;
  phone: string | null;
  prefecture: string | null;
  city: string | null;
  address: string | null;
  building: string | null;
};

export default async function ReserveFormPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; from?: string; to?: string; guests?: string; error?: string }>;
}) {
  const { plan: planId, from, to, guests, error } = await searchParams;
  if (!planId) notFound();

  const supabase = createAdminClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("*, plan_prices(price_per_night)")
    .eq("id", planId)
    .single();
  if (!plan) notFound();

  const pricePerNight = (plan.plan_prices ?? [])[0]?.price_per_night ?? 0;
  const hasDates = from && to && eachNight(from, to).length >= 1;
  const price = hasDates ? calcPrice(from!, to!, pricePerNight, (plan.discounts ?? []) as Discount[]) : null;
  const nextUrl = `/reserve/form?${new URLSearchParams({
    plan: planId,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(guests ? { guests } : {}),
  }).toString()}`;

  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  let profile: CustomerProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from("customers")
      .select("last_name, first_name, last_name_kana, first_name_kana, email, phone, prefecture, city, address, building")
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    profile = data as CustomerProfile | null;
  }

  return (
    <div className="space-y-6">
      <Link href={`/reserve/${planId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        ← 戻る
      </Link>

      {/* 予約サマリ */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h1 className="text-lg font-semibold text-gray-900">{plan.name}</h1>
        <p className="mt-1 text-sm text-gray-600">SUGOMORI（1日1組限定）</p>
        {price && (
          <div className="mt-3 flex items-end justify-between border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-600">{from} 〜 {to}（{price.nights}泊）/ {guests ?? 1}名</p>
            <div className="text-right">
              {price.discountRate > 0 && (
                <p className="text-xs text-gray-500 line-through">¥{price.subtotal.toLocaleString()}</p>
              )}
              <p className="text-xl font-bold text-gray-900">¥{price.total.toLocaleString()}</p>
              <p className="text-xs text-gray-500">税・サービス料込</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="rounded-2xl border border-gray-200 p-5 text-sm">
        {user ? (
          <p className="text-gray-700">
            {user.email} でログイン中です。登録済みの情報を入力欄に反映しています。
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gray-700">一度泊まったことがある場合はこちら</p>
            <Link
              href={`/account/login?next=${encodeURIComponent(nextUrl)}`}
              className="rounded-full border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ログインして入力を省略
            </Link>
          </div>
        )}
      </div>

      <form action={startCheckout} className="space-y-6">
        <input type="hidden" name="plan" value={planId} />
        <input type="hidden" name="from" value={from ?? ""} />
        <input type="hidden" name="to" value={to ?? ""} />
        <input type="hidden" name="guests" value={guests ?? "1"} />

        <div className="space-y-4 rounded-2xl border border-gray-200 p-6">
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>氏名 <span className="text-red-500">*</span></span>
            <div className="flex gap-2">
              <input name="last_name" placeholder="姓" required defaultValue={profile?.last_name ?? ""} className={field} />
              <input name="first_name" placeholder="名" required defaultValue={profile?.first_name ?? ""} className={field} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>氏名（カナ） <span className="text-red-500">*</span></span>
            <div className="flex gap-2">
              <input name="last_name_kana" placeholder="セイ" required defaultValue={profile?.last_name_kana ?? ""} className={field} />
              <input name="first_name_kana" placeholder="メイ" required defaultValue={profile?.first_name_kana ?? ""} className={field} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>メールアドレス <span className="text-red-500">*</span></span>
            <input type="email" name="email" placeholder="abcde@example.com" required defaultValue={profile?.email ?? user?.email ?? ""} className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>メールアドレス（確認） <span className="text-red-500">*</span></span>
            <input type="email" name="email2" placeholder="abcde@example.com" required defaultValue={profile?.email ?? user?.email ?? ""} className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>電話番号 <span className="text-red-500">*</span></span>
            <input name="phone" placeholder="0312345678" required defaultValue={profile?.phone ?? ""} className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>都道府県（自宅） <span className="text-red-500">*</span></span>
            <input name="prefecture" placeholder="北海道" required defaultValue={profile?.prefecture ?? ""} className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>市区町村（自宅） <span className="text-red-500">*</span></span>
            <input name="city" placeholder="広尾郡大樹町" required defaultValue={profile?.city ?? ""} className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>番地（自宅） <span className="text-red-500">*</span></span>
            <input name="address" placeholder="山海谷町1-3-11" required defaultValue={profile?.address ?? ""} className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>建物名（自宅）</span>
            <input name="building" placeholder="谷海山ビル3階" defaultValue={profile?.building ?? ""} className={field} />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 p-6">
          <div className="grid gap-2 md:grid-cols-[160px_1fr] md:items-center">
            <span className={label}>チェックイン予定時刻 <span className="text-red-500">*</span></span>
            <div className="flex items-center gap-2">
              <select name="ci_hour" required defaultValue="15" className={`${field} w-24`}>
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span>:</span>
              <select name="ci_min" required defaultValue="00" className={`${field} w-24`}>
                {MINS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 p-6">
          <div className="grid gap-2 md:grid-cols-[160px_1fr]">
            <span className={label}>ご要望・アンケート</span>
            <textarea name="survey" rows={3} placeholder="・宿泊の目的&#10;・ご要望など" className={field} />
          </div>
          <div className="grid gap-2 md:grid-cols-[160px_1fr]">
            <span className={label}>連絡事項</span>
            <textarea name="contact" rows={3} placeholder="連絡事項がございましたらご入力ください" className={field} />
          </div>
        </div>

        <div className="flex justify-center">
          <button className="rounded-full bg-[#d46a2a] px-12 py-3 font-medium text-white transition hover:bg-[#d46a2a]">
            お支払いへ進む
          </button>
        </div>
      </form>
    </div>
  );
}
