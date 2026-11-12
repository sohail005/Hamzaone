import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/server/auth";

// Only checks that a session cookie is present — this runs on every matched
// request, so the actual KV lookup/role check happens in the page/route
// handler instead of here to avoid a KV round-trip per request.
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
