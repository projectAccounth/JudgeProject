import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // forward the request to the backend auth/logout endpoint
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // include cookies from the browser (via proxy) by forwarding cookie header
            body: await req.text(),
            credentials: "include"
        }
    );

    const text = await res.text();

    return new NextResponse(text, {
        status: res.status,
        headers: {
            // forward Set-Cookie header so browser receives cleared cookie
            "Set-Cookie": res.headers.get("set-cookie") ?? ""
        }
    });
}
