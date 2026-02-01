import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const body = await request.json();

        const cookies = request.headers.get("cookie") || "";

        const response = await fetch(
            `${API_BASE}/admin/users/${userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookies,
                },
                body: JSON.stringify(body),
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const cookies = request.headers.get("cookie") || "";

        const response = await fetch(
            `${API_BASE}/admin/users/${userId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookies,
                },
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch user" },
            { status: 500 }
        );
    }
}