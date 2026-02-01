"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/app/lib/api";
import styles from "./Stats.module.css";
import Link from "next/link";

interface GlobalStats {
    total: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    byStatus: Record<string, number>;
    byLanguage: Record<string, number>;
    byVerdict: Record<string, number>;
    performance: {
        avgTime: string | number;
        fastestTime: number;
        totalTime: number;
        avgMemory: string | number;
        peakMemory: number;
    };
}

interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    accepted: number;
    submissions: number;
    acceptanceRate: string;
}

export default function StatsPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const [globalStats, board] = await Promise.all([
                    api.getGlobalStats(),
                    api.getLeaderboard(20)
                ]);
                setStats(globalStats);
                setLeaderboard(board);
            } catch (err) {
                console.log(err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

    if (loading) {
        return (
            <main className={styles.container}>
                <div className={styles.loading}>{t("common.loading")}</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className={styles.container}>
                <div className={styles.error}>{t("common.error")}: {error}</div>
            </main>
        );
    }

    if (!stats) {
        return (
            <main className={styles.container}>
                <div className={styles.noData}>{t("common.error")}</div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1>{t("stats.title")}</h1>
                <p>{t("stats.subtitle")}</p>
            </div>

            {/* Overall Stats Cards */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t("stats.totalSubmissions")}</div>
                    <div className={styles.statValue}>{stats.total.toLocaleString()}</div>
                    <div className={styles.statUnit}>{t("stats.submissions")}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t("stats.accepted")}</div>
                    <div className={`${styles.statValue} ${styles.accepted}`}>
                        {stats.accepted.toLocaleString()}
                    </div>
                    <div className={styles.statUnit}>{t("statsPage.accepted")}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t("stats.acceptanceRate")}</div>
                    <div className={styles.statValue}>{stats.acceptanceRate.toFixed(1)}%</div>
                    <div className={styles.statUnit}>{t("statsPage.ofTotal")}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t("stats.averageTime")}</div>
                    <div className={styles.statValue}>{stats.performance.avgTime}</div>
                    <div className={styles.statUnit}>{t("statsPage.ms")}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t("stats.averageMemory")}</div>
                    <div className={styles.statValue}>{stats.performance.avgMemory}</div>
                    <div className={styles.statUnit}>{t("statsPage.mb")}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>{t("stats.peakMemory")}</div>
                    <div className={styles.statValue}>{stats.performance.peakMemory}</div>
                    <div className={styles.statUnit}>{t("statsPage.mb")}</div>
                </div>
            </section>

            {/* Language Distribution */}
            <section className={styles.section}>
                <h2>{t("stats.languageDistribution")}</h2>
                <div className={styles.distributionGrid}>
                    {Object.entries(stats.byLanguage).map(([lang, count]) => (
                        <div key={lang} className={styles.distributionItem}>
                            <span className={styles.distLabel}>{lang}</span>
                            <div className={styles.distBar}>
                                <div
                                    className={styles.distBarFill}
                                    style={{
                                        width: `${(count / stats.total) * 100}%`
                                    }}
                                />
                            </div>
                            <span className={styles.distCount}>
                                {count} ({((count / stats.total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Verdict Distribution */}
            <section className={styles.section}>
                <h2>{t("stats.verdictDistribution")}</h2>
                <div className={styles.verdictGrid}>
                    {Object.entries(stats.byVerdict).map(([verdict, count]) => (
                        <div key={verdict} className={styles.verdictItem}>
                            <span className={styles.verdictLabel}>{verdict}</span>
                            <span className={styles.verdictCount}>{count}</span>
                            <span className={styles.verdictPercent}>
                                ({((count / stats.total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Leaderboard */}
            <section className={styles.section}>
                <h2>{t("stats.topContributors")}</h2>
                <div className={styles.leaderboardTable}>
                    <div className={styles.tableHeader}>
                        <div className={styles.tableCell} style={{ flex: "0 0 60px" }}>{t("stats.rank")}</div>
                        <div className={styles.tableCell} style={{ flex: "1" }}>{t("stats.user")}</div>
                        <div className={styles.tableCell} style={{ flex: "0 0 100px" }}>{t("stats.accepted")}</div>
                        <div className={styles.tableCell} style={{ flex: "0 0 120px" }}>{t("stats.submissions")}</div>
                        <div className={styles.tableCell} style={{ flex: "0 0 120px" }}>{t("stats.rate")}</div>
                    </div>
                    <div className={styles.tableBody}>
                        {leaderboard.map((entry) => (
                            <div key={entry.userId} className={styles.tableRow}>
                                <div className={`${styles.tableCell} ${styles.rank}`}>
                                    #{entry.rank}
                                </div>
                                <div className={styles.tableCell}>
                                    <Link href={`/users/${entry.userId}`} className={styles.userLink}>
                                        {entry.username || entry.userId}
                                    </Link>
                                </div>
                                <div className={`${styles.tableCell} ${styles.accepted}`}>
                                    {entry.accepted}
                                </div>
                                <div className={styles.tableCell}>{entry.submissions}</div>
                                <div className={styles.tableCell}>{entry.acceptanceRate}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className={styles.footer}>
                <Link href="/problems" className={styles.cta}>
                    {t("stats.startSolving")}
                </Link>
            </div>
        </main>
    );
}
