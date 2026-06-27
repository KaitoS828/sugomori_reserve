"use client";

import { useFormStatus } from "react-dom";

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[#d46a2a] py-2.5 text-sm font-medium text-white transition hover:bg-[#b8571f] disabled:cursor-wait disabled:bg-gray-300"
    >
      {pending ? "ログイン中..." : "ログイン"}
    </button>
  );
}
