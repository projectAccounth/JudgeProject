"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { api } from "@/app/lib/api";
import styles from "./ProblemsAdmin.module.css";
import { SearchBox } from "@/app/components/SearchBox";
import { AdminTable } from "@/app/components/admin/AdminPanel";
import { Problem } from "@judgeapp/shared/domain/problem";

export default function ProblemsAdminPage() {
    const [query, setQuery] = useState("");
    const [problems, setProblems] = useState<Problem[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        api.getProblems({ q: query, limit: 100 }).then((res) => {
            setProblems(res.problems);
        });
    }, [query]);

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t("admin.problems.title")}</h1>

                <div className={styles.actions}>
                    <SearchBox
                        value={query}
                        onChange={setQuery}
                        placeholder="Search problems…"
                    />

                    <Link
                        href="/admin/problems/new"
                        className={styles.primaryButton}
                    >
                        {t("admin.problems.createButton")}
                    </Link>
                </div>
            </div>

            <AdminTable
                columns={[
                    "ID",
                    t("admin.problems.columns.title"),
                    t("admin.problems.columns.difficulty"),
                    t("admin.problems.columns.limits"),
                    t("admin.problems.columns.data"),
                    t("admin.problems.columns.testcases"),
                    t("admin.problems.columns.statistics")
                ]}
            >
                {problems.length === 0 && (
                    <tr>
                        <td colSpan={5} className={styles.empty}>
                            No problems found.
                        </td>
                    </tr>
                )}

                {problems.map((p) => (
                    <tr key={p.id} className={styles.row}>
                        <td className={styles.id}>{p.id}</td>

                        <td className={styles.titleCol}>
                            {p.title}
                        </td>

                        <td>
                            <span
                                className={`${styles.badge} ${styles[p.difficulty]}`}
                            >
                                {p.difficulty}
                            </span>
                        </td>

                        <td className={styles.limits}>
                            {p.timeLimitMs}ms / {p.memoryLimitMb}MB
                        </td>

                        <td>
                            <Link
                                href={`/admin/problems/${p.id}`}
                                className={styles.editLink}
                            >
                                {t("admin.problems.editData")}
                            </Link>
                        </td>

                        <td>
                            <Link
                                href={`/admin/problems/${p.id}/testcases`}
                                className={styles.editLink}
                            >
                                {t("admin.problems.editTestcases")}
                            </Link>
                        </td>

                        <td>
                            <Link
                                href={`/problems/${p.id}`}
                                className={styles.editLink}
                            >
                                View problem statistics
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminTable>
        </main>
    );
}
