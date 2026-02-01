"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Problem } from "@judgeapp/shared/domain/problem";
import styles from "./ProblemPicker.module.css";

interface ProblemPickerProps {
    onSelectProblems?: (problems: Problem[]) => void;
    onSave?: (problems: Problem[]) => void | Promise<void>;
    onCancel?: () => void;
    multiSelect?: boolean;
    excludeIds?: string[];
    showActions?: boolean;
    loading?: boolean;
}

export default function ProblemPicker({
    onSelectProblems,
    onSave,
    onCancel,
    multiSelect = true,
    excludeIds = [],
    showActions = false,
    loading: isExternalLoading = false
}: Readonly<ProblemPickerProps>) {
    const { t } = useTranslation();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/getProblemData?limit=1000`);
            if (!res.ok) throw new Error("Failed to load problems");
            const data = await res.json();
            const problems = data.problems || data;
            const filtered = problems.filter((p: Problem) => !excludeIds.includes(p.id));
            setProblems(filtered);
        } catch (err) {
            console.error("Failed to load problems:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProblems = problems.filter((p) => {
        const matchesSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === "all" || p.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    const handleToggleProblem = (problemId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(problemId)) {
            newSelected.delete(problemId);
        } else {
            if (!multiSelect && newSelected.size > 0) {
                newSelected.clear();
            }
            newSelected.add(problemId);
        }
        setSelectedIds(newSelected);
        
        if (onSelectProblems) {
            const selected = problems.filter((p) => newSelected.has(p.id));
            onSelectProblems(selected);
        }
    };

    const handleSave = async () => {
        if (onSave) {
            setSaving(true);
            try {
                const selected = problems.filter((p) => selectedIds.has(p.id));
                await onSave(selected);
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return <div className={styles.container}>{t("common.loading")}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <div className={styles.search}>
                    <input
                        type="text"
                        placeholder={t("common.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.difficulty}>
                    <label htmlFor="difficulty">{t("problem_detail.placeholder")}:</label>
                    <select
                        id="difficulty"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">{t("common.all")}</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            <div className={styles.problemsList}>
                {filteredProblems.length === 0 ? (
                    <div className={styles.empty}>{t("common.no_results")}</div>
                ) : (
                    filteredProblems.map((problem) => (
                        <div
                            key={problem.id}
                            className={`${styles.problemItem} ${selectedIds.has(problem.id) ? styles.selected : ""}`}
                            onClick={() => handleToggleProblem(problem.id)}
                        >
                            <input
                                type={multiSelect ? "checkbox" : "radio"}
                                name="problem"
                                checked={selectedIds.has(problem.id)}
                                onChange={() => {}}
                                className={styles.checkbox}
                            />
                            <div className={styles.problemInfo}>
                                <Link href={`/problems/${problem.id}`} target="_blank" className={styles.problemLink}>
                                    <h4>{problem.title}</h4>
                                </Link>
                                <p className={styles.description}>{problem.description?.substring(0, 100)}</p>
                                <div className={styles.meta}>
                                    <span className={`${styles.difficulty} ${styles[problem.difficulty?.toLowerCase() || "easy"]}`}>
                                        {problem.difficulty || "Easy"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showActions && (
                <div className={styles.actions}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className={styles.btnCancel}
                            disabled={saving || isExternalLoading}
                        >
                            Cancel
                        </button>
                    )}
                    {onSave && (
                        <button
                            onClick={handleSave}
                            className={styles.btnSave}
                            disabled={saving || isExternalLoading || selectedIds.size === 0}
                        >
                            {saving ? "Saving..." : "Save Problems"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
