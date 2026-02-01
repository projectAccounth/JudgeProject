"use client";

import { useTranslation } from "react-i18next";
import styles from "./ProblemPage.module.css";

interface ProblemHeaderProps {
    title: string;
    timeLimitMs: number;
    memoryLimitMb: number;
    difficulty: string;
}

export default function ProblemHeader({
    title,
    timeLimitMs,
    memoryLimitMb,
    difficulty,
}: ProblemHeaderProps) {
    const { t } = useTranslation();

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.bar}>
                <span className={styles.item}>
                    {t("problem_detail.time_limit")}: {timeLimitMs} ms
                </span>
                <span className={styles.item}>
                    {t("problem_detail.memory_limit")}: {memoryLimitMb} MB
                </span>
                <span className={`${styles.item} ${styles.diff}`}>
                    {difficulty}
                </span>
            </div>
        </header>
    );
}
