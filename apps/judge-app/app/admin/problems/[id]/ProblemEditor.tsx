"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/app/lib/api";
import styles from "./ProblemEditor.module.css";
import { usePathname, useRouter } from "next/navigation";
import StatementEditor from "./StatementEditor";
import Link from "next/link";
import { Problem } from "@judgeapp/shared/domain/problem";

export default function ProblemEditor({
    initialProblem,
}: Readonly<{
    initialProblem: Problem;
}>) {
    const { t } = useTranslation();
    const [problem, setProblem] = useState(initialProblem);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    async function save() {
        setSaving(true);

        try {
            api.tryUpdateProblem({
                id: problem.id,
                title: problem.title,
                statement: problem.statement,
                description: problem.description,
                difficulty: problem.difficulty,
                limits: {
                    timeMs: problem.timeLimitMs,
                    memoryMb: problem.memoryLimitMb,
                },
                testcases: [],
                tags: problem.tags || [],
                category: problem.category || []
            });
            alert("Saved!");
            location.reload();
        } catch (e: unknown) {
            alert(e);
        } finally {
            setSaving(false);
        }
    }

    function toTestcases() {
        router.push(`${pathname}/testcases`);
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>
                Editing: {problem.id} · <Link 
                    href={`/problems/${problem.id}`} 
                    className={styles.link}>
                    {problem.title}
                </Link>
            </h1>

            <div className={styles.panel}>
                <div className={styles.field}>
                    <label>{t("admin.problemEditor.formLabels.title")}</label>
                    <input
                        value={problem.title}
                        onChange={(e) =>
                            setProblem({ ...problem, title: e.target.value })
                        }
                    />
                </div>

                <div className={styles.field}>
                    <label>{t("admin.problemEditor.formLabels.description")}</label>
                    <textarea
                        rows={8}
                        value={problem.description}
                        onChange={(e) =>
                            setProblem({
                                ...problem,
                                description: e.target.value,
                            })
                        }
                    />
                </div>

                <div className={styles.field}>
                    <label>Tags (comma separated)</label>
                    <input
                        value={problem.tags ? problem.tags.join(", ") : ""}
                        onChange={(e) =>
                            setProblem({
                                ...problem,
                                tags: String(e.target.value).split(",").map(s => s.trim()).filter(Boolean)
                            })
                        }
                    />
                </div>

                <div className={styles.field}>
                    <label>Categories (comma separated)</label>
                    <input
                        value={problem.category ? problem.category.join(", ") : ""}
                        onChange={(e) =>
                            setProblem({
                                ...problem,
                                category: String(e.target.value).split(",").map(s => s.trim()).filter(Boolean)
                            })
                        }
                    />
                </div>

                <StatementEditor
                    onChange={(e) =>
                        setProblem({
                            ...problem,
                            statement: e
                        })
                    }
                    value={problem.statement}
                >

                </StatementEditor>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label>{t("admin.problemEditor.formLabels.difficulty")}</label>
                        <select
                            value={problem.difficulty}
                            onChange={(e) =>
                                setProblem({
                                    ...problem,
                                    difficulty: e.target.value as Problem["difficulty"],
                                })
                            }
                        >
                            <option value="EASY">{t("admin.problemEditor.difficultyOptions.easy")}</option>
                            <option value="MEDIUM">{t("admin.problemEditor.difficultyOptions.medium")}</option>
                            <option value="HARD">{t("admin.problemEditor.difficultyOptions.hard")}</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Time limit (ms)</label>
                        <input
                            type="number"
                            value={problem.timeLimitMs}
                            onChange={(e) =>
                                setProblem({
                                    ...problem,
                                    timeLimitMs: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Memory limit (MB)</label>
                        <input
                            type="number"
                            value={problem.memoryLimitMb}
                            onChange={(e) =>
                                setProblem({
                                    ...problem,
                                    memoryLimitMb: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                </div>

                <div className={styles.meta}>
                    <div>
                        <strong>Testcase set</strong>:{" "}
                        <code>{problem.testcaseSetId}</code>
                    </div>
                    <div>
                        <strong>Created</strong>:{" "}
                        {new Date(problem.createdAt).toLocaleString()}
                    </div>
                    <div>
                        <strong>Updated</strong>:{" "}
                        {new Date(problem.updatedAt).toLocaleString()}
                    </div>
                </div>

                <button
                    onClick={save}
                    disabled={saving}
                    className={styles.saveButton}
                >
                    {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                    onClick={toTestcases}
                    className={styles.redirectButton}
                >
                    Go to testcases
                </button>
            </div>
        </main>
    );
}
