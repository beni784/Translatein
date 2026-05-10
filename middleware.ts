import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  UNLOCK_PATH,
  getConfiguredPassword,
  isAuthTokenValid,
} from "@/lib/auth";

/**
 * Protects the whole app behind a password gate.
 *
 * Allowed WITHOUT auth:
 *   - /unlock         (the password form itself)
 *   - /api/auth/*     (login & logout endpoints)
 *   - Next.js internals & static assets (filtered via matcher below)
 *
 * Everything else → redirect to /unlock if the auth cookie is missing or
 * doesn't verify against the current APP_PASSWORD.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — no auth needed.
  if (
    pathname === UNLOCK_PATH ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const password = getConfiguredPassword();
  const ok = await isAuthTokenValid(token, password);

  if (ok) return NextResponse.next();

  // Block API routes with 401 JSON instead of redirecting,
  // so the frontend can handle it gracefully.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Sesi kamu sudah berakhir. Silakan login ulang." },
      { status: 401 },
    );
  }

  // For page requests → redirect to /unlock and preserve where they wanted to go.
  const url = request.nextUrl.clone();
  url.pathname = UNLOCK_PATH;
  url.search = ""; // strip any query so it doesn't pollute the redirect target

  const redirectTarget = pathname === "/" ? "/" : pathname;
  url.searchParams.set("next", redirectTarget);

  return NextResponse.redirect(url);
}

/**
 * Run middleware on all paths EXCEPT static assets and Next.js internals.
 * This pattern is the standard Next.js recommendation.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - /_next/static      (static files)
     *   - /_next/image       (image optimization files)
     *   - /favicon.ico, /robots.txt, /sitemap.xml
     *   - Any file with an extension (e.g. .png, .svg, .css, .js, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
