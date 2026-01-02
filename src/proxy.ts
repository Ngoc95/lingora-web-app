import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/get-started", "/forgot-password"];
const PRIVATE_PAGES_PREFIX = [
  "/learn",
  "/vocabulary",
  "/profile",
  "/dashboard",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 1. Redirect if authenticated user tries to access auth pages
  // But allow if we explicitly flagged the session as expired (to break infinite loops)
  if (refreshToken && AUTH_PAGES.some((page) => pathname.startsWith(page))) {
    if (request.nextUrl.searchParams.get("session_expired")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/vocabulary", request.url));
  }

  // 2. Redirect if unauthenticated user tries to access private pages
  if (!refreshToken && PRIVATE_PAGES_PREFIX.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL("/get-started", request.url));
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
