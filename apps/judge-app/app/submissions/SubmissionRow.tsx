"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import styles from "./Submissions.module.css";
import { relativeTime } from "@/app/lib/time";
import { Submission } from "@judgeapp/shared/domain/submission";

interface SubmissionRowProps {
    submission: Submission;
    verdict: string;
}

interface UserInfo {
    id: string;
    username: string;
    email: string;
}

export default function SubmissionRow({ submission, verdict }: Readonly<SubmissionRowProps>) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const userData = await api.getUser(submission.userId);
                setUser(userData);
            } catch (e) {
                console.error("Failed to load user:", e);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, [submission.userId]);

    const displayName = user?.username || submission.userId;
    const userLink = user?.username ? `/users/${submission.userId}` : "#";

    return (
        <tr className={styles.row}>
            <td className={styles.id} title={submission.id}>
                {submission.id.slice(0, 8)}…
            </td>

            <td className={styles.user}>
                {loading ? (
                    <span className={styles.loading}>Loading…</span>
                ) : (
                    <Link href={userLink} className={styles.userLink} title={`View ${displayName}'s profile`}>
                        {displayName}
                    </Link>
                )}
            </td>

            <td className={styles.problem}>
                <Link href={`/problems/${submission.problemId}`} className={styles.problemLink} title={`View problem ${submission.problemId}`}>
                    {submission.problemId}
                </Link>
            </td>

            <td>
                <span
                    className={`${styles.badge} ${styles[verdict]}`}
                >
                    {verdict}
                </span>
            </td>

            <td className={styles.lang}>
                {submission.language}
            </td>

            <td className={styles.time}>
                {relativeTime(submission.createdAt as unknown as string)}
            </td>

            <td className={styles.viewCell}>
                <Link href={`/submissions/${submission.id}`} className={styles.viewBtn}>
                    View
                </Link>
            </td>
        </tr>
    );
}
