import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = await fetch(
        `${process.env.BACKEND_URL}/auth/me`,
        {
            headers: { Cookie: req.headers.get("cookie") ?? "" }
        }
    );

    if (res.status === 401) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}
