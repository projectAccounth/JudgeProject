import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/contests/${id}`, {
        headers: { Cookie: cookie },
        credentials: "include"
    });

    return new Response(await res.text(), {
        status: res.status
    });
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/contests/${id}`, {
        method: "PUT",
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/contests/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
        credentials: "include"
    });

    return new Response(await res.text(), {
        status: res.status
    });
}
