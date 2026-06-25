"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-[#d46a2a] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#d46a2a] print:hidden"
    >
      PDFで保存・印刷
    </button>
  );
}
