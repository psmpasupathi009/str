import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Security middleware:
 * - Verifies signed session cookie (httpOnly)
 * - Blocks unauthenticated access to protected routes
 * - Blocks non-admin access to admin routes/APIs
 * - Injects verified identity headers for server routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/home/admin") || pathname.startsWith("/api/admin");

  const isAuthRequiredApi =
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/orders");

  // Allow public routes without session
  if (!isAdminRoute && !isAuthRequiredApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    // For pages, redirect to signin. For APIs, 401.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/home/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && session.role !== "ADMIN") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Inject verified identity headers for downstream route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-auth-email", session.email);
  requestHeaders.set("x-auth-user-id", session.userId);
  requestHeaders.set("x-auth-role", session.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/home/admin/:path*",
    "/api/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/upload/:path*",
    "/api/orders/:path*",
  ],
};

