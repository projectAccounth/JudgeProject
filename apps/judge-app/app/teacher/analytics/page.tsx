"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../admin/AdminLayout.module.css";

interface TeacherAnalytics {
    totalProblems: number;
    totalSubmissions: number;
    accepted: number;
    rejected: number;
    pending: number;
    avgAcceptanceRate: number;
}

export default function TeacherAnalyticsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user?.role !== "TEACHER" && user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                setAnalyticsLoading(true);
                const response = await fetch(
                    `/api/teacher/analytics`,
                    { credentials: "include" }
                );
                if (!response.ok) {
                    throw new Error("Failed to load analytics");
                }
                const data = await response.json();
                setAnalytics(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading analytics");
            } finally {
                setAnalyticsLoading(false);
            }
        }

        if (user?.role === "TEACHER" || user?.role === "ADMIN") {
            loadAnalytics();
        }
    }, [user]);

    if (loading || analyticsLoading) {
        return <div className={styles.loading}>{t("common.loading")}</div>;
    }

    if (error || !analytics) {
        return <div style={{ color: "#ef4444" }}>{error || "Failed to load analytics"}</div>;
    }

    const StatCard = ({ title, value, color = "#0f172a" }: { title: string; value: string | number; color?: string }) => (
        <div style={{
            background: color,
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #1e293b"
        }}>
            <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>
                {title}
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "#e5e7eb" }}>
                {value}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <h2>{t("teacher.analytics.title")}</h2>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
            }}>
                <StatCard title={t("teacher.analytics.totalProblems")} value={analytics.totalProblems} />
                <StatCard title={t("teacher.analytics.totalSubmissions")} value={analytics.totalSubmissions} />
                <StatCard title={t("teacher.analytics.accepted")} value={analytics.accepted} color="rgba(16, 185, 129, 0.1)" />
                <StatCard title={t("teacher.analytics.rejected")} value={analytics.rejected} color="rgba(239, 68, 68, 0.1)" />
                <StatCard title={t("teacher.analytics.pending")} value={analytics.pending} color="rgba(107, 114, 128, 0.1)" />
                <StatCard title={t("teacher.analytics.acceptanceRate")} value={`${analytics.avgAcceptanceRate}%`} color="rgba(59, 130, 246, 0.1)" />
            </div>

            <div style={{
                background: "#020617",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #1e293b"
            }}>
                <h3>{t("teacher.analytics.summary")}</h3>
                <p>{t("teacher.analytics.summaryText", {
                    problems: analytics.totalProblems,
                    submissions: analytics.totalSubmissions
                })}</p>
                <p>{t("teacher.analytics.acceptanceRateText", {
                    rate: analytics.avgAcceptanceRate
                })}</p>
            </div>
        </div>
    );
}
