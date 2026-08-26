import { ReserveScreen } from "./ReserveScreen";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/reserve", languages: { ja: "/reserve", en: "/en/reserve" } },
};

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; guests?: string }>;
}) {
  const { from, to, guests } = await searchParams;
  return <ReserveScreen locale="ja" from={from} to={to} guests={guests} />;
}
