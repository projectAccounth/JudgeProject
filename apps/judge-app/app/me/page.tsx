"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/app/lib/api";
import Link from "next/link";
import styles from "./Profile.module.css";

interface UserStats {
    totalSubmissions: number;
    accepted: number;
    failed: number;
    pending: number;
    acceptanceRate: string;
}

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Fetch real user-specific stats
    useEffect(() => {
        if (user) {
            async function fetchStats() {
                try {
                    const userStats = await api.getUserStats(user!.id);
                    setStats({
                        totalSubmissions: userStats.total,
                        accepted: userStats.accepted,
                        failed: userStats.failed,
                        pending: userStats.pending,
                        acceptanceRate: userStats.acceptanceRate
                    });
                } catch (error) {
                    console.error("Failed to fetch user stats:", error);
                    setStats({
                        totalSubmissions: 0,
                        accepted: 0,
                        failed: 0,
                        pending: 0,
                        acceptanceRate: "0.00"
                    });
                } finally {
                    setLoadingStats(false);
                }
            }
            fetchStats();
        }
    }, [user]);

    if (loading || !user) {
        return (
            <main className={styles.container}>
                <div className={styles.loading}>{t("common.loading")}</div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div className={styles.profileCard}>
                    <div className={styles.avatar}>
                        {user.id.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userId}>{user.id}</h1>
                        <p className={styles.role}>{t("profile.role")}: {user.role}</p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            {loadingStats ? (
                <div className={styles.loading}>{t("common.loading")}</div>
            ) : stats ? (
                <section className={styles.statsSection}>
                    <h2>{t("profile.statistics")}</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>{t("profile.totalSubmissions")}</div>
                            <div className={styles.statValue}>{stats.totalSubmissions}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statLabel} ${styles.accepted}`}>{t("profile.accepted")}</div>
                            <div className={`${styles.statValue} ${styles.accepted}`}>{stats.accepted}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statLabel} ${styles.failed}`}>{t("profile.failed")}</div>
                            <div className={`${styles.statValue} ${styles.failed}`}>{stats.failed}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statLabel} ${styles.pending}`}>{t("profile.pending")}</div>
                            <div className={`${styles.statValue} ${styles.pending}`}>{stats.pending}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>{t("profile.acceptanceRate")}</div>
                            <div className={styles.statValue}>{stats.acceptanceRate}%</div>
                        </div>
                    </div>
                </section>
            ) : null}

            {/* Quick Links */}
            <section className={styles.quickLinks}>
                <h2>{t("profile.quickLinks")}</h2>
                <div className={styles.linkGrid}>
                    <Link href="/problems" className={styles.linkCard}>
                        <span className={styles.linkIcon}>💻</span>
                        <span className={styles.linkText}>{t("profile.viewProblems")}</span>
                    </Link>
                    <Link href="/submissions" className={styles.linkCard}>
                        <span className={styles.linkIcon}>📤</span>
                        <span className={styles.linkText}>{t("profile.mySubmissions")}</span>
                    </Link>
                    <Link href="/stats" className={styles.linkCard}>
                        <span className={styles.linkIcon}>📊</span>
                        <span className={styles.linkText}>{t("profile.globalStats")}</span>
                    </Link>
                    <Link href="/instructions" className={styles.linkCard}>
                        <span className={styles.linkIcon}>📚</span>
                        <span className={styles.linkText}>{t("profile.guide")}</span>
                    </Link>
                </div>
            </section>

            {/* Account Settings */}
            <section className={styles.settings}>
                <h2>{t("profile.account")}</h2>
                <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                        <div>
                            <h3>{t("profile.userId")}</h3>
                            <p className={styles.mono}>{user.id}</p>
                        </div>
                    </div>
                    <div className={styles.settingItem}>
                        <div>
                            <h3>{t("profile.role")}</h3>
                            <p>{user.role}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
