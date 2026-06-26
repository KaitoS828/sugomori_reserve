import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";

function expectedToken() {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  return createHash("sha256").update(`${u}|${p}|${s}`).digest("hex");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!isLogin) {
    const token = request.cookies.get("admin_token")?.value;
    if (token !== expectedToken()) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/admin/:path*"],
};
