import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ submissionId: string }> }
) {
    try {
        const { submissionId } = await params;
        const cookies = request.headers.get("cookie") || "";

        const response = await fetch(
            `${API_BASE}/admin/submissions/${submissionId}`,
            {
                method: "DELETE",
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
            { error: error instanceof Error ? error.message : "Failed to delete submission" },
            { status: 500 }
        );
    }
}
