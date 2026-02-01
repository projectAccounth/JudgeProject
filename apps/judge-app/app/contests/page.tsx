"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Contest, ContestStatus } from "@/app/lib/types";
import styles from "./contests.module.css";

export default function ContestsPage() {
    const { t } = useTranslation();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ContestStatus | "all">("all");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadContests();
    }, []);

    const loadContests = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/contests");
            if (!response.ok) throw new Error("Failed to load contests");
            const data = await response.json();
            setContests(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const getContestStatus = (contest: Contest): ContestStatus => {
        const now = new Date();
        const starts = new Date(contest.starts_at);
        const ends = new Date(contest.ends_at);

        if (now < starts) return "upcoming";
        if (now > ends) return "finished";
        return "ongoing";
    };

    const getFilteredContests = () => {
        if (filter === "all") return contests;
        return contests.filter((c) => getContestStatus(c) === filter);
    };

    const filteredContests = getFilteredContests();

    if (loading) {
        return <main className={styles.container}>{t("common.loading")}</main>;
    }

    return (
        <main className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t("contests.title")}</h1>
                    <p className={styles.subtitle}>{t("contests.subtitle")}</p>
                </div>
                <Link href="/contests/create" className={styles.createButton}>
                    {t("contests.create")} +
                </Link>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                {(["all", "upcoming", "ongoing", "finished"] as const).map((status) => (
                    <button
                        key={status}
                        className={`${styles.filterBtn} ${filter === status ? styles.active : ""}`}
                        onClick={() => setFilter(status)}
                    >
                        {t(`contests.status.${status}`)}
                    </button>
                ))}
            </div>

            {/* Error message */}
            {error && <div className={styles.error}>{error}</div>}

            {/* Contests list */}
            {filteredContests.length === 0 ? (
                <div className={styles.empty}>
                    <p>{t("contests.empty")}</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredContests.map((contest) => {
                        const status = getContestStatus(contest);
                        const startsDate = new Date(contest.starts_at);
                        const endsDate = new Date(contest.ends_at);

                        return (
                            <Link
                                key={contest.id}
                                href={`/contests/${contest.id}`}
                                className={`${styles.card} ${styles[status]}`}
                            >
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{contest.name}</h3>
                                    <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
                                        {t(`contests.status.${status}`)}
                                    </span>
                                </div>

                                <p className={styles.cardDesc}>{contest.description}</p>

                                <div className={styles.cardMeta}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>{t("contests.starts")}</span>
                                        <span className={styles.metaValue}>
                                            {startsDate.toLocaleDateString()} {startsDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>{t("contests.ends")}</span>
                                        <span className={styles.metaValue}>
                                            {endsDate.toLocaleDateString()} {endsDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    {contest.is_public ? (
                                        <span className={styles.visibility}>🌐 {t("contests.public")}</span>
                                    ) : (
                                        <span className={styles.visibility}>🔒 {t("contests.private")}</span>
                                    )}
                                    <span className={styles.cta}>
                                        {status === "ongoing" ? t("contests.view") : t("contests.details")} →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
