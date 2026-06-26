import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string; sent?: string; email?: string }>;
}) {
  const { error, redirect, sent, email } = await searchParams;

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center">
          <h1 className="text-xl font-semibold text-white">メールを送信しました</h1>
          <p className="text-sm text-gray-400">
            <span className="text-cyan-400">{email}</span> に確認メールを送りました。
            <br />メール内のリンクをクリックしてログインしてください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-8"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-white">SUGOMORI 管理</h1>
          <p className="text-sm text-gray-400">管理画面にログイン</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <input type="hidden" name="redirect" value={redirect ?? "/admin"} />

        <label className="block space-y-1">
          <span className="text-sm text-gray-400">メールアドレス</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-gray-950 transition hover:bg-cyan-400"
        >
          確認メールを送る
        </button>
      </form>
    </main>
  );
}
