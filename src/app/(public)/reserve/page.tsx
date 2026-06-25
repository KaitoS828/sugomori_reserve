import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, Facility, Discount } from "@/types/db";
import { ReserveCalendar } from "./ReserveCalendar";

export const dynamic = "force-dynamic";

type PlanRow = Plan & {
  plan_prices: {
    price_per_night: number;
    guest_prices: Record<string, number> | null;
    room_type_id: string;
    room_types: { capacity: number } | null;
  }[];
};

export default async function ReservePage() {
  const supabase = createAdminClient();
  const [{ data: planData }, { data: facilityData }] = await Promise.all([
    supabase
      .from("plans")
      .select("*, plan_prices(price_per_night, guest_prices, room_type_id, room_types(capacity))")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("facility").select("*").limit(1).single(),
  ]);

  const planRows = (planData ?? []) as unknown as PlanRow[];
  const facility = (facilityData ?? null) as Facility | null;

  const roomTypeId = planRows[0]?.plan_prices[0]?.room_type_id ?? "";
  const maxGuests = planRows[0]?.plan_prices[0]?.room_types?.capacity ?? 6;
  const plans = planRows.map((p) => ({
    id: p.id,
    name: p.name,
    tags: (p.tags ?? []) as string[],
    pricePerNight: p.plan_prices[0]?.price_per_night ?? 0,
    guestPrices: p.plan_prices[0]?.guest_prices ?? null,
    discounts: (p.discounts ?? []) as Discount[],
  }));

  return (
    <div className="space-y-8">
      {/* ヒーローバナー（建物写真・幅100%・高さ控えめ） */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 h-40 md:h-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/trailhouse.jpeg"
          alt="トレイルハウス SUGOMORI の外観（満天の星の下）"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5 md:p-7 text-white">
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-white/80">Trail House</p>
          <h1 className="mt-1 text-xl tracking-[0.15em] md:text-2xl">トレイルハウス SUGOMORI</h1>
          <p className="mt-1 text-sm tracking-[0.05em] text-white/85">{facility?.address ?? ""}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <aside className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-900">所在地</p>
            <p className="text-gray-600">{facility?.address ?? "—"}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">お問い合わせ</p>
            <p className="text-gray-600">{facility?.phone ?? "—"}</p>
          </div>
        </aside>

        <div>
          {roomTypeId ? (
            <ReserveCalendar plans={plans} roomTypeId={roomTypeId} maxGuests={maxGuests} />
          ) : (
            <p className="text-sm text-gray-500">現在ご予約いただけるプランがありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
