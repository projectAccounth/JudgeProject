// app/api/auth/me/route.ts
import { cookies } from "next/headers";

export async function GET() {
    const cookie = (await cookies()).getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/me`,
        {
            headers: { Cookie: cookie },
            credentials: "include"
        }
    );

    return new Response(await res.text(), {
        status: res.status
    });
}
