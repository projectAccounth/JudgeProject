import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/contests/${id}/standings`, {
        headers: { Cookie: cookie },
        credentials: "include"
    });

    return new Response(await res.text(), {
        status: res.status
    });
}
