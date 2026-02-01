"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../admin/AdminLayout.module.css";

interface Problem {
    id: string;
    title: string;
    difficulty: string;
    createdAt: string;
    submissionCount: number;
    acceptedCount: number;
}

export default function TeacherProblemsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [problemsLoading, setProblemsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user?.role !== "TEACHER" && user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadProblems() {
            try {
                setProblemsLoading(true);
                const response = await fetch(
                    `/api/teacher/problems`,
                    { credentials: "include" }
                );
                if (!response.ok) {
                    throw new Error("Failed to load problems");
                }
                const data = await response.json();
                setProblems(data.problems || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading problems");
            } finally {
                setProblemsLoading(false);
            }
        }

        if (user?.role === "TEACHER" || user?.role === "ADMIN") {
            loadProblems();
        }
    }, [user]);

    if (loading || problemsLoading) {
        return <div className={styles.loading}>{t("common.loading")}</div>;
    }

    return (
        <div className={styles.container}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>{t("teacher.myProblems.title")}</h2>
                <Link href="/teacher/create" style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    textDecoration: "none"
                }}>
                    + Create Problem
                </Link>
            </div>

            {error && <div style={{ color: "#ef4444", marginBottom: "10px" }}>{error}</div>}

            {problems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <p>{t("teacher.myProblems.noProblems")}</p>
                    <Link href="/teacher/create" style={{ color: "#2563eb" }}>
                        Create your first problem
                    </Link>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t("teacher.myProblems.columns.title")}</th>
                                <th>{t("teacher.myProblems.columns.difficulty")}</th>
                                <th>{t("teacher.myProblems.columns.submissions")}</th>
                                <th>{t("teacher.myProblems.columns.accepted")}</th>
                                <th>{t("teacher.myProblems.columns.created")}</th>
                                <th>{t("teacher.myProblems.columns.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.title}</td>
                                    <td>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            background: p.difficulty === "EASY" ? "#10b981" : p.difficulty === "MEDIUM" ? "#f59e0b" : "#ef4444",
                                            color: "white"
                                        }}>
                                            {p.difficulty}
                                        </span>
                                    </td>
                                    <td>{p.submissionCount}</td>
                                    <td>{p.acceptedCount}</td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/admin/problems/${p.id}`} style={{ color: "#2563eb", marginRight: "10px" }}>
                                            {t("teacher.myProblems.edit")}
                                        </Link>
                                        <Link href={`/teacher/problems/${p.id}/submissions`} style={{ color: "#2563eb" }}>
                                            {t("teacher.myProblems.viewSubmissions")}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
