"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./Submissions.module.css";

interface PaginationProps {
    nextCursor?: string;
    currentPage?: number;
}

export default function Pagination({ nextCursor, currentPage = 1 }: Readonly<PaginationProps>) {
    const searchParams = useSearchParams();

    // Construct the query string while preserving filters
    const buildQueryString = (page: number, cursor?: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(page));
        if (cursor) {
            params.set("cursor", cursor);
        } else {
            params.delete("cursor");
        }
        return params.toString();
    };

    if (!nextCursor && currentPage === 1) {
        return null;
    }

    return (
        <div className={styles.paginationContainer}>
            {currentPage > 1 && (
                <Link
                    href={`/submissions?${buildQueryString(currentPage - 1)}`}
                    className={styles.paginationBtn}
                >
                    ← Previous
                </Link>
            )}

            <div className={styles.pageInfo}>
                Page {currentPage}
            </div>

            {nextCursor && (
                <Link
                    href={`/submissions?${buildQueryString(currentPage + 1, nextCursor)}`}
                    className={styles.paginationBtn}
                >
                    Next →
                </Link>
            )}
        </div>
    );
}
