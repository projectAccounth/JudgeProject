import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/register`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }
    );

    const text = await res.text();

    return new NextResponse(text, { status: res.status });
}
