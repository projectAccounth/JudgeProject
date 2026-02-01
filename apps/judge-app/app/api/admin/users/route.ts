import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const limit = url.searchParams.get("limit") || "20";
        const offset = url.searchParams.get("offset") || "0";
        const q = url.searchParams.get("q");

        const cookies = request.headers.get("cookie") || "";
        
        let backendUrl = `${API_BASE}/admin/users?limit=${limit}&offset=${offset}`;
        if (q) {
            backendUrl = `${API_BASE}/admin/users/search?q=${encodeURIComponent(q)}`;
        }

        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookies,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch users" },
            { status: 500 }
        );
    }
}
