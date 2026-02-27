import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RT_COOKIE_NAME = process.env.NEXT_PUBLIC_RT_COOKIE_NAME || "rt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const rt = req.cookies.get(RT_COOKIE_NAME);
  if (!rt) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
