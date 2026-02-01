import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include"
        }
    );

    const text = await res.text();

    return new NextResponse(text, {
        status: res.status,
        headers: {
            // forward Set-Cookie!
            "Set-Cookie": res.headers.get("set-cookie") ?? ""
        }
    });
}
