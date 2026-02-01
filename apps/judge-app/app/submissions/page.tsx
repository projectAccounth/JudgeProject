import { api } from "@/app/lib/api";
import Link from "next/link";
import styles from "./Submissions.module.css";
import { relativeTime } from "@/app/lib/time";
import { Submission } from "@judgeapp/shared/domain/submission"
import SubmissionsHeader from "./SubmissionsHeader";
import SubmissionsTableHeader from "./SubmissionsTableHeader";
import Pagination from "./Pagination";
import SubmissionFilter from "./SubmissionFilter";
import SubmissionRow from "./SubmissionRow";

function getDisplayStatus(s: Submission) {
    if (s.status !== "DONE") {
        return s.status;
    }
    return s.result?.status ?? "UNKNOWN";
}

export default async function SubmissionsPage(props: Readonly<{
    searchParams: Promise<{ cursor?: string; page?: string; verdict?: string; language?: string; problemId?: string }>
}>) {
    const { cursor, page, verdict, language, problemId } = await props.searchParams;
    const currentPage = page ? parseInt(page) : 1;
    
    const result = await api.getSubmissions({
        limit: 30,
        after: cursor,
    });
    
    // Client-side filtering
    const submissions = (result.submissions || []).filter((s: Submission) => {
        if (verdict && getDisplayStatus(s) !== verdict) return false;
        if (language && s.language.toLowerCase() !== language.toLowerCase()) return false;
        if (problemId && s.problemId !== problemId) return false;
        return true;
    });

    const nextCursor = result.nextCursor ? result.nextCursor : null;

    return (
        <main className={styles.container}>
            <SubmissionsHeader />

            <SubmissionFilter verdict={verdict} language={language} problemId={problemId} />

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <SubmissionsTableHeader />

                    <tbody>
                        {submissions.map((s: Submission) => {
                            const verdict = getDisplayStatus(s);

                            return (
                                <SubmissionRow key={s.id} submission={s} verdict={verdict} />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {submissions.length === 0 && (
                <div className={styles.noSubmissions}>
                    <p>No submissions found matching your filters.</p>
                </div>
            )}

            {submissions.length > 0 && (
                <Pagination nextCursor={nextCursor} currentPage={currentPage} />
            )}
        </main>
    );
}
