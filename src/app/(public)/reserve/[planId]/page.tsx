import type { Metadata } from "next";
import { PlanScreen } from "./PlanScreen";
import { planMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  return planMetadata(planId, "ja");
}

export default async function PlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ from?: string; to?: string; guests?: string }>;
}) {
  const { planId } = await params;
  const { from, to, guests } = await searchParams;
  return <PlanScreen planId={planId} from={from} to={to} guests={guests} locale="ja" />;
}
