"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { api } from "@/app/lib/api";

interface UserProfile {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                const data = await api.getPublicProfile(userId);
                setProfile(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("common.error"));
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            loadProfile();
        }
    }, [userId, t]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black px-4 py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="inline-block rounded-lg bg-gray-800/50 px-6 py-4">
                        <p className="text-gray-300">{t("common.loading")}</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black px-4 py-20">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-900/20 to-red-800/10 p-8 backdrop-blur-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-red-300">{t("common.error")}</h2>
                        </div>
                        <p className="mb-6 text-gray-300">
                            {error || t("common.error")}
                        </p>
                        <div className="flex gap-3">
                            <Link 
                                href="/problems" 
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700"
                            >
                                {t("nav.problems")}
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-6 py-2 font-semibold text-gray-200 transition-all hover:border-gray-400 hover:bg-gray-800/50"
                            >
                                {t("home.backToHome")}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: "100vh", background: "linear-gradient(to bottom, rgb(15, 23, 42), rgba(30, 58, 138, 0.3), rgb(15, 23, 42))" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
                {/* Profile Card */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "30px",
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    borderRadius: "16px",
                    padding: "30px",
                    backdropFilter: "blur(10px)",
                    marginBottom: "50px"
                }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "white",
                        flexShrink: 0
                    }}>
                        {profile.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: "1.8rem",
                            fontWeight: "700",
                            color: "#e2e8f0",
                            margin: "0 0 8px 0"
                        }}>
                            {profile.username}
                        </h1>
                        <p style={{ color: "#94a3b8", margin: "0 0 4px 0" }}>
                            {t("profile.role")}: {profile.role}
                        </p>
                        <p style={{ color: "#64748b", margin: "0", fontSize: "0.9rem" }}>
                            Joined {new Date(profile.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}
                        </p>
                    </div>
                </div>

                {/* Quick Links */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "15px"
                }}>
                    <Link href="/problems" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "20px",
                        background: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(148, 163, 184, 0.15)",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "#cbd5e1",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(96, 165, 250, 0.5)";
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(30, 41, 59, 0.7)";
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(148, 163, 184, 0.15)";
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(30, 41, 59, 0.4)";
                        (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                    }}>
                        <span style={{ fontSize: "2rem" }}>📋</span>
                        <span style={{ fontWeight: "500", textAlign: "center", fontSize: "0.95rem" }}>{t("nav.problems")}</span>
                    </Link>
                    <Link href="/submissions" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "20px",
                        background: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(148, 163, 184, 0.15)",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "#cbd5e1",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(96, 165, 250, 0.5)";
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(30, 41, 59, 0.7)";
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(148, 163, 184, 0.15)";
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(30, 41, 59, 0.4)";
                        (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                    }}>
                        <span style={{ fontSize: "2rem" }}>📤</span>
                        <span style={{ fontWeight: "500", textAlign: "center", fontSize: "0.95rem" }}>{t("nav.submissions")}</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            padding: "20px",
                            background: "rgba(30, 41, 59, 0.4)",
                            border: "1px solid rgba(148, 163, 184, 0.15)",
                            borderRadius: "12px",
                            textDecoration: "none",
                            color: "#cbd5e1",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            fontSize: "inherit"
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)";
                            e.currentTarget.style.background = "rgba(30, 41, 59, 0.7)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.15)";
                            e.currentTarget.style.background = "rgba(30, 41, 59, 0.4)";
                            e.currentTarget.style.transform = "none";
                        }}>
                        <span style={{ fontSize: "2rem" }}>←</span>
                        <span style={{ fontWeight: "500", textAlign: "center", fontSize: "0.95rem" }}>Back</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
