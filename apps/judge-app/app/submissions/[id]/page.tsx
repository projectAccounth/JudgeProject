"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import CodeEditor from "@/app/components/CodeEditor";
import VerdictBadge from "@/app/components/VerdictBadge";
import ResultView from "./ResultView";
import BeginnerFeedback from "./BeginnerFeedback";
import styles from "./SubmissionDetail.module.css";
import Link from "next/link";
import { Submission } from "@judgeapp/shared/domain/submission";

interface SubmissionDetailParams {
    id: string;
}

interface UserInfo {
    id: string;
    username: string;
    email: string;
}

function isRunning(status: string) {
    return status === "PENDING" || status === "RUNNING";
}

export default function SubmissionDetailPage({ params }: { params: Promise<SubmissionDetailParams> }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        async function load() {
            const s = await api.getSubmission((await params).id);
            setSubmission(s);
            
            if (s && s.userId) {
                try {
                    const userData = await api.getUser(s.userId);
                    setUser(userData);
                } catch (e) {
                    console.error("Failed to load user info:", e);
                }
            }
        }
        const interval = setInterval(() => {
            if (submission && !isRunning(submission.status)) {
                clearInterval(interval);
                return;
            }
            load();
        }, 1000);

        return () => clearInterval(interval);
    }, [params, submission]);

    const handleGoBack = () => {
        if (submission) {
            // Save submission code and language to localStorage for pre-filling the form
            localStorage.setItem(
                `submission_draft_${submission.problemId}`,
                JSON.stringify({
                    sourceCode: submission.sourceCode,
                    language: submission.language,
                    timestamp: Date.now()
                })
            );
            // Navigate back to the problem's submission section
            router.push(`/problems/${submission.problemId}#submit`);
        }
    };

    if (!submission) {
        return <p className={styles.loading}>{t("submission_detail.loading")}</p>;
    }

    return (
        <main className={styles.container}>
            {/* Breadcrumb Navigation */}
            <nav className={styles.breadcrumb}>
                <Link href="/submissions" className={styles.breadcrumbLink}>
                    ← All Submissions
                </Link>
            </nav>

            {/* Header with Verdict */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>{t("submission_detail.title")}</h1>
                        <span className={styles.verdictContainer}>
                            <VerdictBadge verdict={submission.status} showTooltip={true} />
                        </span>
                    </div>
                    <button
                        onClick={handleGoBack}
                        className={styles.goBackButton}
                        title="Go back to problem and adjust your solution"
                    >
                        ← Adjust Solution
                    </button>
                </div>
            </header>

            {/* Navigation Cards */}
            <div className={styles.navCards}>
                <Link href={`/problems/${submission.problemId}`} className={styles.navCard}>
                    <div className={styles.navCardIcon}>📋</div>
                    <div className={styles.navCardContent}>
                        <div className={styles.navCardLabel}>Problem</div>
                        <div className={styles.navCardValue}>{submission.problemId}</div>
                    </div>
                    <span className={styles.navCardArrow}>→</span>
                </Link>

                <Link href={`/users/${submission.userId}`} className={styles.navCard}>
                    <div className={styles.navCardIcon}>👤</div>
                    <div className={styles.navCardContent}>
                        <div className={styles.navCardLabel}>User</div>
                        <div className={styles.navCardValue}>{user?.username || submission.userId}</div>
                    </div>
                    <span className={styles.navCardArrow}>→</span>
                </Link>

                <div className={styles.navCard} style={{ pointerEvents: "none", cursor: "default" }}>
                    <div className={styles.navCardIcon}>⚙️</div>
                    <div className={styles.navCardContent}>
                        <div className={styles.navCardLabel}>Language</div>
                        <div className={styles.navCardValue}>{submission.language}</div>
                    </div>
                </div>
            </div>

            {/* Meta Info */}
            <div className={styles.meta}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t("submission_detail.id")}</span>
                    <code>{submission.id}</code>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Submitted</span>
                    <span>{new Date(submission.createdAt).toLocaleString()}</span>
                </div>
                {submission.finishedAt && (
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Judged</span>
                        <span>{new Date(submission.finishedAt).toLocaleString()}</span>
                    </div>
                )}
            </div>

            {/* Source */}
            <section className={styles.section}>
                <details className={styles.editorBlock} open={false}>
                    <summary className={styles.editorHeader}>
                        <span>{t("submission_detail.source_code")}</span>
                        <span className={styles.editorHint}>
                            {submission.language}
                        </span>
                    </summary>

                    <div className={styles.editor}>
                        <CodeEditor
                            value={submission.sourceCode}
                            language={
                                submission.language === "python"
                                    ? "python" :
                                submission.language === "cpp"
                                    ? "cpp"
                                    : "javascript"
                            }
                            onChange={() => {}}
                            readOnly={true}
                        />
                    </div>
                </details>
            </section>

            {submission.result && (
                <>
                    <BeginnerFeedback submission={submission} />
                    <ResultView result={submission.result} />
                </>
            )}
        </main>
    );
}
