"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Contest, ContestProblem } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import ProblemPicker from "@/app/components/ProblemPicker";
import { backendGet, backendPost, backendDelete, backendPatch } from "@/app/lib/backendFetch";
import styles from "./edit.module.css";

export default function ContestEditPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [contestProblems, setContestProblems] = useState<ContestProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedProblems, setSelectedProblems] = useState<any[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load contest details
            const contestRes = await backendGet<Contest>(`/contests/${contestId}`);
            if (contestRes.error) throw new Error(contestRes.error);
            const contestData = contestRes.data!;

            // Check if user is creator
            if (contestData.created_by !== user?.id) {
                setError("Unauthorized to edit this contest");
                setTimeout(() => router.push(`/contests/${contestId}`), 2000);
                return;
            }

            setContest(contestData);

            // Load contest problems
            const problemsRes = await backendGet<ContestProblem[]>(`/contests/${contestId}/problems`);
            if (!problemsRes.error && problemsRes.data) {
                setContestProblems(problemsRes.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) {
            loadData();
        }
    }, [contestId]);

    const handleAddProblems = async (selectedProblems: any[]) => {
        try {
            setSaving(true);
            for (const problem of selectedProblems) {
                const position = (contestProblems?.length || 0) + 1;

                const res = await backendPost(`/contests/${contestId}/problems`, {
                    problem_id: problem.id,
                    position,
                });

                if (res.error) throw new Error(res.error);
            }

            // Refresh data
            await loadData();
            setShowPicker(false);
            setSelectedProblems([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add problems");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveProblem = async (problemId: string) => {
        if (!confirm("Remove this problem from the contest?")) return;

        try {
            setSaving(true);
            const res = await backendDelete(`/contests/${contestId}/problems/${problemId}`);

            if (res.error) throw new Error(res.error);

            // Refresh data
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove problem");
        } finally {
            setSaving(false);
        }
    };

    const handleReorderProblems = async (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;

        const newOrder = [...contestProblems];
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);

        // Update positions
        const updates = newOrder.map((p, i) => ({ ...p, position: i + 1 }));

        try {
            setSaving(true);
            // Send updates to server
            for (let i = 0; i < updates.length; i++) {
                const res = await backendPatch(
                    `/contests/${contestId}/problems/${updates[i].problem_id}`,
                    { position: i + 1 }
                );
                if (res.error) throw new Error(res.error);
            }
            setContestProblems(updates);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reorder problems");
            await loadData(); // Reload on error
        } finally {
            setSaving(false);
        }
    };

    const handleUploadProblem = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", file);

            // Upload to shared problem pool
            const uploadRes = await fetch("/addProblem", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Failed to upload problem");
            const uploadedProblem = await uploadRes.json();

            // Add to contest
            const addRes = await backendPost(`/contests/${contestId}/problems`, {
                problem_id: uploadedProblem.id,
                position: (contestProblems?.length || 0) + 1,
            });

            if (addRes.error) throw new Error(addRes.error);

            // Refresh data
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload problem");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    if (loading) {
        return <main className={styles.container}>{t("common.loading")}</main>;
    }

    if (error && !contest) {
        return <main className={styles.container}><div className={styles.error}>{error}</div></main>;
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Link href={`/contests/${contestId}`} className={styles.backLink}>
                        ← {t("common.back")}
                    </Link>
                    <h1>{contest?.name} - {t("contests.editProblems")}</h1>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.sections}>
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>{t("contests.contestProblems")} ({contestProblems.length})</h2>
                        <button
                            onClick={() => setShowPicker(!showPicker)}
                            className={styles.addBtn}
                            disabled={saving}
                        >
                            {showPicker ? "✕ " + t("common.cancel") : "+ " + t("common.add")}
                        </button>
                    </div>

                    {showPicker && (
                        <div className={styles.pickerSection}>
                            <ProblemPicker
                                onSelectProblems={(selected) => setSelectedProblems(selected)}
                                onSave={handleAddProblems}
                                onCancel={() => {
                                    setShowPicker(false);
                                    setSelectedProblems([]);
                                }}
                                excludeIds={contestProblems.map(p => p.problem_id)}
                                multiSelect={true}
                                showActions={true}
                                loading={saving}
                            />
                        </div>
                    )}

                    {contestProblems.length === 0 ? (
                        <p className={styles.empty}>{t("contests.noProblems")}</p>
                    ) : (
                        <div className={styles.problemsList}>
                            {contestProblems.map((problem, index) => (
                                <div key={problem.problem_id} className={styles.problemItem}>
                                    <div className={styles.dragHandle}>⋮⋮</div>
                                    <div className={styles.problemInfo}>
                                        <span className={styles.position}>{problem.position}</span>
                                        <span className={styles.title}>{problem.problem_id}</span>
                                    </div>
                                    <div className={styles.actions}>
                                        {index > 0 && (
                                            <button
                                                onClick={() => handleReorderProblems(index, index - 1)}
                                                className={styles.btnSmall}
                                                disabled={saving}
                                                title="Move up"
                                            >
                                                ↑
                                            </button>
                                        )}
                                        {index < contestProblems.length - 1 && (
                                            <button
                                                onClick={() => handleReorderProblems(index, index + 1)}
                                                className={styles.btnSmall}
                                                disabled={saving}
                                                title="Move down"
                                            >
                                                ↓
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemoveProblem(problem.problem_id)}
                                            className={styles.btnSmall + " " + styles.btnDanger}
                                            disabled={saving}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}