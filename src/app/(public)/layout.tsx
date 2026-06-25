import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-mincho">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/reserve" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-campfire/40 font-inter text-[10px] uppercase tracking-[0.2em] text-campfire">
              SG
            </span>
            <span className="text-lg tracking-[0.15em] text-gray-900">
              トレイルハウス SUGOMORI
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm tracking-[0.08em]">
            <Link href="/reserve" className="text-campfire">
              予約
            </Link>
            <Link href="/reserve/lookup" className="text-gray-500 transition hover:text-gray-900">
              予約照会
            </Link>
            <Link href="/account" className="text-gray-500 transition hover:text-gray-900">
              マイページ
            </Link>
            <Link href="/account/login" className="text-gray-500 transition hover:text-gray-900">
              ログイン
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>

      <footer className="mt-20 border-t border-gray-200 py-10 print:hidden">
        <div className="mx-auto mb-4 h-px w-10 bg-campfire/60"></div>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-sm tracking-[0.08em] text-gray-500">
          <Link href="/reserve/lookup" className="transition hover:text-gray-900">予約照会</Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="transition hover:text-gray-900">利用規約</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="transition hover:text-gray-900">プライバシーポリシー</Link>
        </div>
        <p className="mt-4 text-center font-inter text-xs tracking-[0.2em] text-gray-400">
          © {new Date().getFullYear()} TRAIL HOUSE SUGOMORI
        </p>
      </footer>
    </div>
  );
}
