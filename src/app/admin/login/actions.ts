"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "crypto";

function expectedToken() {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  return createHash("sha256").update(`${u}|${p}|${s}`).digest("hex");
}

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    redirect(`/admin/login?error=${encodeURIComponent("ユーザーIDまたはパスワードが違います")}&redirect=${encodeURIComponent(redirectTo)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", expectedToken(), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(redirectTo);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}
