"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface DashboardStats {
    totalUsers?: number;
    totalProblems?: number;
    totalSubmissions?: number;
    acceptedSubmissions?: number;
}

export default function AdminDashboard() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({});
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!loading && user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadStats() {
            try {
                setStatsLoading(true);
                // Load stats from various admin endpoints
                const [usersRes, submissionsRes] = await Promise.all([
                    fetch("/api/admin/users?limit=1&offset=0", { credentials: "include" }),
                    fetch("/api/admin/stats/submissions", { credentials: "include" })
                ]);

                let totalUsers = 0;
                let totalSubmissions = 0;
                let acceptedSubmissions = 0;

                if (usersRes.ok) {
                    const userData = await usersRes.json();
                    totalUsers = userData.total || 0;
                }

                if (submissionsRes.ok) {
                    const submissionsData = await submissionsRes.json();
                    totalSubmissions = submissionsData.total || 0;
                    acceptedSubmissions = submissionsData.accepted || 0;
                }

                setStats({
                    totalUsers,
                    totalSubmissions,
                    acceptedSubmissions
                });
            } catch (err) {
                console.error("Error loading stats:", err);
            } finally {
                setStatsLoading(false);
            }
        }

        if (!loading && user?.role === "ADMIN") {
            loadStats();
        }
    }, [loading, user]);

    if (loading || statsLoading) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <div>
            <h1>{t("adminPanel.title")}</h1>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                <Card title={t("adminPanel.totalUsers")} value={stats.totalUsers || 0} />
                <Card title={t("adminPanel.totalSubmissions")} value={stats.totalSubmissions || 0} />
                <Card title={t("adminPanel.acceptedSubmissions")} value={stats.acceptedSubmissions || 0} />
                <Card title={t("adminPanel.problems")} value={t("adminPanel.viewAll")} link="/admin/problems" />
            </div>
        </div>
    );
}

function Card({
    title,
    value,
    link
}: {
    title: string;
    value: string | number;
    link?: string;
}) {
    return (
        <div style={{
            background: "#020617",
            padding: 16,
            borderRadius: 10,
            border: "1px solid #1e293b",
            cursor: link ? "pointer" : "default",
            transition: "all 0.2s"
        }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
                {title}
            </div>
            {link ? (
                <a href={link} style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "none",
                    display: "block"
                }}>
                    {value}
                </a>
            ) : (
                <div style={{ fontSize: 22, fontWeight: 600 }}>
                    {value}
                </div>
            )}
        </div>
    );
}
