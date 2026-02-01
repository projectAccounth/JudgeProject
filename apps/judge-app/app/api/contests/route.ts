import { cookies } from "next/headers";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE}/contests${status ? `?status=${status}` : ""}`;
    
    const res = await fetch(backendUrl, {
        headers: { Cookie: cookie },
        credentials: "include"
    });

    return new Response(await res.text(), {
        status: res.status
    });
}

export async function POST(request: Request) {
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/contests`, {
        method: "POST",
        headers: { 
            Cookie: cookie,
            "Content-Type": "application/json"
        },
        body: await request.text(),
        credentials: "include"
    });

    return new Response(await res.text(), {
        status: res.status
    });
}
