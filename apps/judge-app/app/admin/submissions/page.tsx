"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../AdminLayout.module.css";

interface Submission {
    id: string;
    userId: string;
    username: string;
    problemId: string;
    problemTitle: string;
    language: string;
    verdict: string;
    createdAt: string;
    timeMs?: number;
    memoryMb?: number;
}

interface SubmissionsResponse {
    submissions: Submission[];
    total: number;
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

export default function AdminSubmissionsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const limit = 50;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [filterVerdict, setFilterVerdict] = useState<string>("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadSubmissions() {
            try {
                setSubmissionsLoading(true);
                let url = `/api/admin/submissions?limit=${limit}&offset=${offset}`;
                if (filterVerdict) {
                    url += `&verdict=${filterVerdict}`;
                }
                const response = await fetch(url, { credentials: "include" });
                if (!response.ok) {
                    throw new Error("Failed to load submissions");
                }
                const data: SubmissionsResponse = await response.json();
                setSubmissions(data.submissions);
                setTotal(data.total);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading submissions");
            } finally {
                setSubmissionsLoading(false);
            }
        }

        if (user?.role === "ADMIN") {
            loadSubmissions();
        }
    }, [user, limit, offset, filterVerdict]);

    const handleDeleteSubmission = async (submissionId: string) => {
        if (!confirm(t("admin.submissions.confirmDelete"))) {
            return;
        }

        try {
            setDeleteLoading(submissionId);
            const response = await fetch(`/api/admin/submissions/${submissionId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to delete submission");
            }

            // Remove from state
            setSubmissions(submissions.filter(s => s.id !== submissionId));
            setTotal(total - 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting submission");
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading || submissionsLoading) {
        return <div className={styles.loading}>{t("common.loading")}</div>;
    }

    const verdicts = ["ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "COMPILATION_ERROR", "RUNTIME_ERROR", "PENDING"];

    return (
        <div className={styles.container}>
            <h2>{t("adminPanel.submissions")}</h2>

            {error && <div className={styles.error}>{error}</div>}

            <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                <label style={{ marginRight: "10px", fontWeight: 500, color: "#cbd5f5" }}>{t("adminPanel.tableHeaders.verdict")}:</label>
                <select 
                    value={filterVerdict} 
                    onChange={(e) => { setFilterVerdict(e.target.value); setOffset(0); }} 
                    className={styles.select}
                >
                    <option value="">{t("submissions.all_verdicts")}</option>
                    {verdicts.map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t("adminPanel.id")}</th>
                            <th>{t("adminPanel.tableHeaders.userId")}</th>
                            <th>{t("adminPanel.tableHeaders.problemId")}</th>
                            <th>{t("submission_form.language")}</th>
                            <th>{t("adminPanel.tableHeaders.verdict")}</th>
                            <th>{t("results.ms")}</th>
                            <th>{t("results.kb")}</th>
                            <th>{t("adminPanel.tableHeaders.submittedAt")}</th>
                            <th>{t("adminPanel.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                                    {t("common.error")}
                                </td>
                            </tr>
                        ) : (
                            submissions.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{s.id.slice(0, 8)}...</td>
                                    <td>
                                        <Link href={`/users/${s.userId}`} className={styles.link}>
                                            {s.username}
                                        </Link>
                                    </td>
                                    <td>
                                        <Link href={`/problems/${s.problemId}`} className={styles.link}>
                                            {s.problemTitle}
                                        </Link>
                                    </td>
                                    <td>{s.language}</td>
                                    <td>
                                        <span style={{
                                            color: VERDICT_COLORS[s.verdict] || "#6b7280",
                                            fontWeight: 600
                                        }}>
                                            {s.verdict}
                                        </span>
                                    </td>
                                    <td>{s.timeMs ? `${s.timeMs}ms` : "-"}</td>
                                    <td>{s.memoryMb ? `${s.memoryMb}MB` : "-"}</td>
                                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <Link href={`/submissions/${s.id}`} className={styles.link}>
                                                {t("adminPanel.view")}
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteSubmission(s.id)}
                                                disabled={deleteLoading === s.id}
                                                className={styles.dangerButton}
                                                style={{
                                                    padding: "4px 8px",
                                                    fontSize: "12px",
                                                    opacity: deleteLoading === s.id ? 0.6 : 1
                                                }}
                                            >
                                                {deleteLoading === s.id ? `${t("adminPanel.loading")}...` : t("adminPanel.delete")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                >
                    {t("adminPanel.previous")}
                </button>
                <span>
                    {t("adminPanel.page")} {Math.floor(offset / limit) + 1} {t("adminPanel.of")} {Math.ceil(total / limit)}
                </span>
                <button
                    onClick={() =>
                        setOffset(offset + limit > total ? offset : offset + limit)
                    }
                    disabled={offset + limit >= total}
                >
                    {t("adminPanel.next")}
                </button>
            </div>
        </div>
    );
}
