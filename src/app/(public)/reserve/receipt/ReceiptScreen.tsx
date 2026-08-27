import { createAdminClient } from "@/lib/supabase/admin";
import { dict, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { PrintButton } from "./PrintButton";

type ReceiptResv = {
  code: string; check_in: string; check_out: string; nights: number;
  amount: number; payment_status: string; created_at: string; receipt_name: string | null;
  customers: { last_name: string | null; first_name: string | null } | null;
  plans: { name: string } | null;
  payments: { stripe_payment_intent_id: string | null; created_at: string }[] | null;
};

const TAX_RATE = 0.1;

/** 税込金額から税抜・消費税額を出す（1円未満切り捨て）。 */
function splitTax(amountIncludingTax: number): { taxable: number; tax: number } {
  const taxable = Math.floor(amountIncludingTax / (1 + TAX_RATE));
  return { taxable, tax: amountIncludingTax - taxable };
}

// 日英で同じ中身を出すための画面本体。
// 日本語は「領収書」の体裁、英語は receipt として読める体裁にする。
export async function ReceiptScreen({
  code,
  token,
  locale,
}: {
  code?: string;
  token?: string;
  locale: Locale;
}) {
  const t = dict(locale).receipt;
  const c = dict(locale).common;
  const supabase = createAdminClient();

  let resv: ReceiptResv | null = null;
  if (code && token) {
    const { data } = await supabase
      .from("reservations")
      .select(
        "code, check_in, check_out, nights, amount, payment_status, created_at, receipt_name, customers(last_name, first_name), plans(name), payments(stripe_payment_intent_id, created_at)",
      )
      .eq("code", code)
      .eq("lookup_token", token)
      .maybeSingle();
    resv = (data as unknown as ReceiptResv) ?? null;
  }
  const { data: facility } = await supabase.from("facility").select("name, address, phone").limit(1).single();

  if (!resv) {
    return <p className="text-sm text-gray-500">{t.cannotShow}</p>;
  }
  if (resv.payment_status !== "paid") {
    return <p className="text-sm text-gray-500">{t.notPaidYet}</p>;
  }

  const guestName = [resv.customers?.last_name, resv.customers?.first_name].filter(Boolean).join(" ") || t.fallbackName;
  const name = resv.receipt_name?.trim() || guestName;
  const issued = new Date(resv.created_at).toLocaleDateString(locale === "en" ? "en-GB" : "ja-JP");
  const { taxable, tax } = splitTax(resv.amount);
  const latestPayment = [...(resv.payments ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
  const paymentMethodLabel = latestPayment?.stripe_payment_intent_id
    ? t.paymentMethodCard
    : t.paymentMethodOther;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex justify-end">
        <PrintButton label={t.print} />
      </div>

      <div className="printable rounded-2xl border border-gray-300 bg-white p-10">
        <h1 className="text-center text-2xl font-bold tracking-widest text-gray-900">{t.title}</h1>
        <p className="mt-2 text-right text-sm text-gray-500">{t.issuedOn(issued)}</p>

        <div className="mt-8 space-y-1">
          <p className="border-b border-gray-400 pb-1 text-lg text-gray-900">{t.honorific(name)}</p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">{t.amount}</p>
          <p className="text-3xl font-bold text-gray-900">¥{resv.amount.toLocaleString()}-</p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-700">{t.forStay(resv.plans?.name ?? "—")}</p>

        <table className="mx-auto mt-8 text-sm text-gray-700">
          <tbody>
            <tr><td className="py-1 pr-6 text-gray-500">{c.reservationCode}</td><td className="font-mono">{resv.code}</td></tr>
            <tr>
              <td className="py-1 pr-6 text-gray-500">{t.stayDates}</td>
              <td>{dict(locale).cancel.dateRange(resv.check_in, resv.check_out, resv.nights)}</td>
            </tr>
            <tr><td className="py-1 pr-6 text-gray-500">{t.paymentMethod}</td><td>{paymentMethodLabel}</td></tr>
          </tbody>
        </table>

        <table className="mx-auto mt-6 border-t border-gray-200 pt-2 text-sm text-gray-600">
          <tbody>
            <tr>
              <td className="py-1 pr-6 text-gray-500">{t.taxableAmount}</td>
              <td className="text-right">¥{taxable.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-1 pr-6 text-gray-500">
                {t.taxAmount}
                <span className="ml-1 text-xs text-gray-400">({t.taxRateNote})</span>
              </td>
              <td className="text-right">¥{tax.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-2 text-center text-xs text-gray-500">{t.received}</p>

        <div className="mt-10 text-right text-sm text-gray-700">
          <p className="font-semibold text-gray-900">{facility?.name}</p>
          <p>{locale === "en" ? SITE.address.fullEn : facility?.address}</p>
          <p>{facility?.phone}</p>
        </div>
      </div>
    </div>
  );
}
