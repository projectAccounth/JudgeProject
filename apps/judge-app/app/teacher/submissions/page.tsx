"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../../admin/AdminLayout.module.css";

interface Submission {
    id: string;
    userId: string;
    language: string;
    verdict: string;
    createdAt: string;
}

export default function TeacherSubmissionsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const limit = 50;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!loading && user?.role !== "TEACHER" && user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadSubmissions() {
            try {
                setSubmissionsLoading(true);
                const response = await fetch(
                    `/api/teacher/submissions?limit=${limit}&offset=${offset}`,
                    { credentials: "include" }
                );
                if (!response.ok) {
                    throw new Error("Failed to load submissions");
                }
                const data = await response.json();
                setSubmissions(data.submissions || []);
                setTotal(data.total || 0);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading submissions");
            } finally {
                setSubmissionsLoading(false);
            }
        }

        if (user?.role === "TEACHER" || user?.role === "ADMIN") {
            loadSubmissions();
        }
    }, [user, limit, offset]);

    if (loading || submissionsLoading) {
        return <div className={styles.loading}>{t("common.loading")}</div>;
    }

    const VERDICT_COLORS: Record<string, string> = {
        "ACCEPTED": "#10b981",
        "WRONG_ANSWER": "#ef4444",
        "TIME_LIMIT_EXCEEDED": "#f59e0b",
        "MEMORY_LIMIT_EXCEEDED": "#f59e0b",
        "COMPILATION_ERROR": "#8b5cf6",
        "RUNTIME_ERROR": "#ec4899",
        "PENDING": "#6b7280"
    };

    return (
        <div className={styles.container}>
            <h2>{t("teacher.studentSubmissions.title")}</h2>

            {error && <div style={{ color: "#ef4444", marginBottom: "10px" }}>{error}</div>}

            {submissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <p>{t("teacher.studentSubmissions.noSubmissions")}</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t("teacher.studentSubmissions.columns.id")}</th>
                                <th>{t("teacher.studentSubmissions.columns.userId")}</th>
                                <th>{t("teacher.studentSubmissions.columns.language")}</th>
                                <th>{t("teacher.studentSubmissions.columns.verdict")}</th>
                                <th>{t("teacher.studentSubmissions.columns.submitted")}</th>
                                <th>{t("teacher.studentSubmissions.columns.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{s.id.slice(0, 8)}...</td>
                                    <td>{s.userId.slice(0, 8)}...</td>
                                    <td>{s.language}</td>
                                    <td>
                                        <span style={{
                                            color: VERDICT_COLORS[s.verdict] || "#6b7280",
                                            fontWeight: 600
                                        }}>
                                            {s.verdict}
                                        </span>
                                    </td>
                                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                                    <td>
                                        <Link href={`/submissions/${s.id}`} style={{ color: "#2563eb" }}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.pagination}>
                <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                >
                    Previous
                </button>
                <span>
                    Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                </span>
                <button
                    onClick={() =>
                        setOffset(offset + limit > total ? offset : offset + limit)
                    }
                    disabled={offset + limit >= total}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
