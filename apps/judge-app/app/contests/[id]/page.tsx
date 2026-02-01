"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Contest, ContestProblem, ContestStanding, ContestStatus } from "@/app/lib/types";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./contest.module.css";

export default function ContestDetailPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<ContestProblem[]>([]);
    const [standings, setStandings] = useState<ContestStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [activeTab, setActiveTab] = useState<"problems" | "standings">("problems");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (contestId) {
            loadContestDetails();
            checkRegistration();
        }
    }, [contestId]);

    const loadContestDetails = async () => {
        try {
            setLoading(true);
            const [contestRes, problemsRes, standingsRes] = await Promise.all([
                fetch(`/api/contests/${contestId}`),
                fetch(`/api/contests/${contestId}/problems`),
                fetch(`/api/contests/${contestId}/standings`),
            ]);

            if (!contestRes.ok) throw new Error("Failed to load contest");

            const contestData = await contestRes.json();
            setContest(contestData);

            if (problemsRes.ok) {
                const problemsData = await problemsRes.json();
                setProblems(problemsData);
            }

            if (standingsRes.ok) {
                const standingsData = await standingsRes.json();
                setStandings(standingsData);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            const res = await fetch(`/api/contests/${contestId}/registration`);
            if (res.ok) {
                setRegistered(true);
            }
        } catch (err) {
            // Not registered
        }
    };

    const handleRegister = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        try {
            setRegistering(true);
            const res = await fetch(`/api/contests/${contestId}/register`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to register");
            setRegistered(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return <main className={styles.container}>{t("common.loading")}</main>;
    }

    if (!contest) {
        return (
            <main className={styles.container}>
                <div className={styles.error}>{t("contests.notFound")}</div>
            </main>
        );
    }

    const status = getContestStatus(contest);
    const isStarted = status !== "upcoming";

    return (
        <main className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>{contest.name}</h1>
                    <p className={styles.subtitle}>{contest.description}</p>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>{t("contests.status")}</span>
                            <span className={`${styles.metaBadge} ${styles[`badge_${status}`]}`}>
                                {t(`contests.status.${status}`)}
                            </span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>{t("contests.time")}</span>
                            <span className={styles.metaValue}>
                                {new Date(contest.starts_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    {user?.id === contest.created_by && (
                        <Link href={`/contests/${contestId}/edit`} className={styles.editBtn}>
                            ✏️ {t("common.edit")}
                        </Link>
                    )}
                    {status === "ongoing" && !registered && (
                        <button
                            className={styles.registerBtn}
                            onClick={handleRegister}
                            disabled={registering}
                        >
                            {registering ? t("common.loading") : t("contests.register")}
                        </button>
                    )}
                </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "problems" ? styles.active : ""}`}
                    onClick={() => setActiveTab("problems")}
                >
                    {t("contests.problems")} ({problems.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "standings" ? styles.active : ""}`}
                    onClick={() => setActiveTab("standings")}
                >
                    {t("contests.standings")} ({standings.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === "problems" ? (
                <div className={styles.problems}>
                    {problems.length === 0 ? (
                        <div className={styles.empty}>{t("contests.noProblems")}</div>
                    ) : (
                        <div className={styles.problemsList}>
                            {problems.map((p, idx) => (
                                <Link
                                    key={p.problem_id}
                                    href={registered && isStarted ? `/contests/${contestId}/problems/${p.problem_id}` : "#"}
                                    className={`${styles.problemItem} ${!isStarted ? styles.locked : ""}`}
                                >
                                    <span className={styles.problemIndex}>{String.fromCharCode(65 + idx)}</span>
                                    <div className={styles.problemInfo}>
                                        <h4>{p.title || `Problem ${p.position}`}</h4>
                                        <span className={`${styles.difficulty} ${styles[p.difficulty?.toLowerCase() || "easy"]}`}>
                                            {p.difficulty || t("problems.easy")}
                                        </span>
                                    </div>
                                    {!isStarted && <span className={styles.lock}>🔒</span>}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.standings}>
                    {standings.length === 0 ? (
                        <div className={styles.empty}>{t("contests.noStandings")}</div>
                    ) : (
                        <div className={styles.table}>
                            <div className={styles.tableHeader}>
                                <div className={styles.col}>Rank</div>
                                <div className={styles.col}>{t("contests.participant")}</div>
                                <div className={styles.col}>{t("contests.solved")}</div>
                                <div className={styles.col}>{t("contests.penalty")}</div>
                            </div>
                            {standings.map((standing) => (
                                <div key={standing.user_id} className={styles.tableRow}>
                                    <div className={styles.col}>{standing.rank}</div>
                                    <div className={styles.col}>
                                        <Link href={`/users/${standing.user_id}`} className={styles.username}>
                                            {standing.username}
                                        </Link>
                                    </div>
                                    <div className={styles.col}>{standing.solved}</div>
                                    <div className={styles.col}>{standing.penalty}min</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Back Button */}
            <Link href="/contests" className={styles.backBtn}>
                ← {t("contests.backToList")}
            </Link>
        </main>
    );
}

function getContestStatus(contest: Contest): ContestStatus {
    const now = new Date();
    const starts = new Date(contest.starts_at);
    const ends = new Date(contest.ends_at);

    if (now < starts) return "upcoming";
    if (now > ends) return "finished";
    return "ongoing";
}
