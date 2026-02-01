"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./TestcaseEditor.module.css";
import { api } from "@/app/lib/api";
import Link from "next/link";

type Visibility = "PRIVATE" | "SAMPLE";

type Testcase = {
    id: string;
    testcaseSetId: string;
    order: number;
    input: string;
    expectedOutput: string;
    visibility: Visibility;
};

const LARGE_THRESHOLD = 4_096;
const PREVIEW_SIZE = 512;
const MAX_PAYLOAD_BYTES = 256 * 1024;

/* --- helpers --- */

function approxSize(tc: Testcase): number {
    return tc.input.length * 2 + tc.expectedOutput.length * 2;
}

function chunkUpserts(
    testcases: Testcase[],
    maxBytes: number,
): Testcase[][] {
    const chunks: Testcase[][] = [];
    let current: Testcase[] = [];
    let size = 0;

    for (const tc of testcases) {
        const nextSize = approxSize(tc);

        if (current.length > 0 && size + nextSize > maxBytes) {
            chunks.push(current);
            current = [];
            size = 0;
        }

        current.push(tc);
        size += nextSize;
    }

    if (current.length > 0) {
        chunks.push(current);
    }

    return chunks;
}

/* --- component --- */

export default function TestcaseEditor({
    testcaseSetId,
    initialTestcases,
    problemId,
    problemName,
}: {
    testcaseSetId: string;
    initialTestcases: Testcase[];
    problemId: string;
    problemName: string;
}) {
    const { t } = useTranslation();
    const [testcases, setTestcases] =
        useState<Testcase[]>(initialTestcases);

    const [collapsed, setCollapsed] = useState<boolean[]>([]);
    const [expanded, setExpanded] = useState<boolean[]>([]);
    const [saving, setSaving] = useState(false);

    /* track deletions explicitly */
    const removedIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        setCollapsed(
            initialTestcases.map(
                (tc) =>
                    tc.input.length > LARGE_THRESHOLD ||
                    tc.expectedOutput.length > LARGE_THRESHOLD,
            ),
        );
        setExpanded(initialTestcases.map(() => false));
    }, [initialTestcases]);

    function updateTestcase(index: number, patch: Partial<Testcase>) {
        setTestcases((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...patch };
            return next;
        });
    }

    function addTestcase() {
        setTestcases((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                testcaseSetId,
                order: prev.length,
                input: "",
                expectedOutput: "",
                visibility: "PRIVATE",
            },
        ]);
        setCollapsed((c) => [...c, false]);
        setExpanded((e) => [...e, true]);
    }

    function removeTestcase(index: number) {
        setTestcases((prev) => {
            const tc = prev[index];
            if (tc) {
                removedIds.current.add(tc.id);
            }

            return prev
                .filter((_, i) => i !== index)
                .map((tc, i) => ({ ...tc, order: i }));
        });

        setCollapsed((c) => c.filter((_, i) => i !== index));
        setExpanded((e) => e.filter((_, i) => i !== index));
    }

    async function handleFolderImport(
        e: React.ChangeEvent<HTMLInputElement>,
    ) {
        removedIds.current.clear();

        const files = Array.from(e.target.files ?? []);

        type Group = {
            input?: File;
            output?: File;
            visibility: Visibility;
        };

        const groups = new Map<string, Group>();

        for (const file of files) {
            const rel = file.webkitRelativePath;
            const parts = rel.split("/");
            const dir = parts.slice(0, -1).join("/").toLowerCase();

            const visibility: Visibility =
                dir.includes("sample") ? "SAMPLE" : "PRIVATE";

            const name = file.name.toLowerCase();
            const base = name.replace(
                /\.(in|inp|input|out|ans|output)$/,
                "",
            );

            const key = `${dir}/${base}`;

            if (!groups.has(key)) {
                groups.set(key, { visibility });
            }

            const g = groups.get(key)!;

            if (name.match(/\.(in|inp|input)$/)) g.input = file;
            if (name.match(/\.(out|ans|output)$/)) g.output = file;
        }

        const imported: Testcase[] = [];

        for (const g of groups.values()) {
            if (!g.input || !g.output) continue;

            imported.push({
                id: crypto.randomUUID(),
                testcaseSetId,
                order: imported.length,
                visibility: g.visibility,
                input: await g.input.text(),
                expectedOutput: await g.output.text(),
            });
        }

        setTestcases(imported);
        setCollapsed(
            imported.map(
                (tc) =>
                    tc.input.length > LARGE_THRESHOLD ||
                    tc.expectedOutput.length > LARGE_THRESHOLD,
            ),
        );
        setExpanded(imported.map(() => false));
    }

    async function save() {
        setSaving(true);

        try {
            const ordered = testcases.map((tc, i) => ({
                ...tc,
                order: i,
            }));

            const upsertChunks = chunkUpserts(
                ordered,
                MAX_PAYLOAD_BYTES,
            );

            /* send removals once */
            if (removedIds.current.size > 0) {
                await api.tryUpdateTestcase({
                    set_id: testcaseSetId,
                    remove: Array.from(removedIds.current),
                });
            }

            /* send upserts in chunks */
            for (const chunk of upsertChunks) {
                await api.tryUpdateTestcase({
                    set_id: testcaseSetId,
                    upserts: chunk,
                });
            }

            removedIds.current.clear();
            alert("Testcases saved!");
        } catch (e) {
            alert(e);
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>
                Testcases · {problemId} ·{" "}
                <Link href={`/problems/${problemId}`} className={styles.link}>
                    {problemName}
                </Link>
            </h1>

            <div className={styles.panel}>
                {testcases.map((tc, i) => {
                    const isLarge =
                        tc.input.length > LARGE_THRESHOLD ||
                        tc.expectedOutput.length > LARGE_THRESHOLD;

                    return (
                        <div key={tc.id} className={styles.testcase}>
                            <div className={styles.header}>
                                <span>#{i + 1}</span>

                                <select
                                    value={tc.visibility}
                                    onChange={(e) =>
                                        updateTestcase(i, {
                                            visibility:
                                                e.target.value as Visibility,
                                        })
                                    }
                                >
                                    <option value="PRIVATE">{t("admin.testcaseEditor.visibilityOptions.private")}</option>
                                    <option value="SAMPLE">{t("admin.testcaseEditor.visibilityOptions.sample")}</option>
                                </select>

                                {isLarge && (
                                    <button
                                        className={styles.secondary}
                                        onClick={() =>
                                            setExpanded((e) =>
                                                e.map((v, j) =>
                                                    j === i ? !v : v,
                                                ),
                                            )
                                        }
                                    >
                                        {expanded[i]
                                            ? "Hide content"
                                            : "View content"}
                                    </button>
                                )}

                                <button
                                    onClick={() => removeTestcase(i)}
                                    className={styles.delete}
                                >
                                    ✕
                                </button>
                            </div>

                            {isLarge && !expanded[i] && (
                                <div className={styles.largeNotice}>
                                    <div>
                                        Input:{" "}
                                        {tc.input.length.toLocaleString()} bytes
                                    </div>
                                    <pre>
                                        {tc.input.slice(0, PREVIEW_SIZE)}
                                        {tc.input.length > PREVIEW_SIZE && "…"}
                                    </pre>
                                </div>
                            )}

                            {(!isLarge || expanded[i]) && (
                                <div className={styles.io}>
                                    <div className={styles.field}>
                                        <label>{t("admin.testcaseEditor.labels.input")}</label>
                                        <textarea
                                            rows={4}
                                            defaultValue={tc.input}
                                            onBlur={(e) =>
                                                updateTestcase(i, {
                                                    input: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label>{t("admin.testcaseEditor.labels.output")}</label>
                                        <textarea
                                            rows={4}
                                            defaultValue={tc.expectedOutput}
                                            onBlur={(e) =>
                                                updateTestcase(i, {
                                                    expectedOutput:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className={styles.actions}>
                    <label className={styles.secondary}>
                        Import folder
                        <input
                            type="file"
                            webkitdirectory=""
                            directory=""
                            multiple
                            hidden
                            onChange={handleFolderImport}
                        />
                    </label>

                    <button
                        onClick={addTestcase}
                        className={styles.secondary}
                    >
                        + Add testcase
                    </button>

                    <button
                        onClick={save}
                        disabled={saving}
                        className={styles.primary}
                    >
                        {saving ? "Saving…" : "Save all"}
                    </button>
                </div>
            </div>
        </main>
    );
}
