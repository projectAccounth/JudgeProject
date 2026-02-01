"use client";

import { useEffect } from "react";
import { api } from "@/app/lib/api";

export default function LogoutPage() {

    useEffect(() => {
        async function handleLogout() {
            try {
                await api.logout();
            } catch (error) {
                console.error("Logout failed:", error);
            } finally {
                // Full reload to ensure middleware and auth state refresh
                window.location.href = "/";
            }
        }

        handleLogout();
    }, []);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(15, 23, 42, 0.5))",
            color: "#e2e8f0",
            fontSize: "1.1rem"
        }}>
            Logging out...
        </div>
    );
}
