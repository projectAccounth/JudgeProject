"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/app/lib/api";
import styles from "./CreateProblemForm.module.css";
import { Problem } from "@judgeapp/shared/domain/problem";

function generateProblemId(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function CreateProblemForm() {
    const router = useRouter();
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [id, setId] = useState("");
    const [difficulty, setDifficulty] = useState("EASY");
    const [timeMs, setTimeMs] = useState(1000);
    const [memoryMb, setMemoryMb] = useState(256);
    const [creating, setCreating] = useState(false);

    async function create() {
        if (!id || !title) {
            alert("ID and title are required");
            return;
        }

        setCreating(true);

        try {
            await api.createProblem({
                id,
                title,
                description: "",
                statement: "",
                difficulty: difficulty as Problem["difficulty"],
                limits: {
                    timeMs,
                    memoryMb,
                },
                testcases: [],
            });

            router.push(`/admin/problems/${id}`);
        } catch (e: unknown) {
            alert(e);
        } finally {
            setCreating(false);
        }
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>{t("createProblem.heading")}</h1>

            <div className={styles.panel}>
                <div className={styles.field}>
                    <label>{t("createProblem.formLabels.title")}</label>
                    <input
                        value={title}
                        onChange={(e) => {
                            const v = e.target.value;
                            setTitle(v);
                            setId(generateProblemId(v));
                        }}
                    />
                </div>

                <div className={styles.field}>
                    <label>{t("createProblem.formLabels.problemId")}</label>
                    <input
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label>{t("createProblem.formLabels.difficulty")}</label>
                        <select
                            value={difficulty}
                            onChange={(e) =>
                                setDifficulty(e.target.value)
                            }
                        >
                            <option value="EASY">{t("createProblem.difficultyOptions.easy")}</option>
                            <option value="MEDIUM">{t("createProblem.difficultyOptions.medium")}</option>
                            <option value="HARD">{t("createProblem.difficultyOptions.hard")}</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Time limit (ms)</label>
                        <input
                            type="number"
                            value={timeMs}
                            onChange={(e) =>
                                setTimeMs(Number(e.target.value))
                            }
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Memory limit (MB)</label>
                        <input
                            type="number"
                            value={memoryMb}
                            onChange={(e) =>
                                setMemoryMb(Number(e.target.value))
                            }
                        />
                    </div>
                </div>

                <button
                    onClick={create}
                    disabled={creating}
                    className={styles.primary}
                >
                    {creating ? "Creating…" : "Create problem"}
                </button>
            </div>
        </main>
    );
}
