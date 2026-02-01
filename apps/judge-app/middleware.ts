import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/me", "/submissions"];

// Admin routes that require ADMIN role
const ADMIN_ROUTES = ["/admin"];

// Teacher routes that require TEACHER or ADMIN role
const TEACHER_ROUTES = ["/teacher"];

// Public routes that redirect to home if already authenticated
const PUBLIC_AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if user has a session cookie
    const sessionId = request.cookies.get("session_id")?.value;
    const userRole = request.cookies.get("user_role")?.value;

    // If trying to access admin routes without ADMIN role
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (!sessionId || userRole !== "ADMIN") {
            // Redirect to home
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // If trying to access teacher routes without TEACHER or ADMIN role
    if (TEACHER_ROUTES.some(route => pathname.startsWith(route))) {
        if (!sessionId || (userRole !== "TEACHER" && userRole !== "ADMIN")) {
            // Redirect to home
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // If trying to access protected route without session
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        if (!sessionId) {
            // Redirect to login
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If trying to access public auth routes with session
    if (PUBLIC_AUTH_ROUTES.some(route => pathname.startsWith(route))) {
        if (sessionId) {
            // Redirect to home
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

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
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    ],
};
