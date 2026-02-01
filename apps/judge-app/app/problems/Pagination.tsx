"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "./Problems.module.css";

interface PaginationProps {
    q: string;
    difficulty: string;
    tags?: string;
    category?: string;
    nextCursor: string;
    since?: string;
    page: number;
}

export default function Pagination({
    q,
    difficulty,
    tags,
    category,
    nextCursor,
    since,
    page,
}: Readonly<PaginationProps>) {
    const { t } = useTranslation();

    const buildQuery = (cursor?: string) => {
        const query: Partial<Record<string, string | number>> = {
            q: q || undefined,
            difficulty: difficulty || undefined,
            tags: tags || undefined,
            category: category || undefined,
            since,
            page: cursor ? page + 1 : page,
        };

        if (cursor) {
            query.after = cursor;
        }

        return Object.entries(query)
            .filter(([, v]) => v !== undefined)
            .reduce((acc, [k, v]) => {
                if (v !== undefined) {
                    acc[k] = v;
                }
                return acc;
            }, {} as Record<string, string | number>);
    };

    return (
        <div className={styles.pagination}>
            <Link
                className={`${styles.pageBtn} ${page <= 1 ? styles.disabled : ""}`}
                href={{
                    pathname: "/problems",
                    query: { q, difficulty, tags, category, page: Math.max(1, page - 1) },
                }}
            >
                ← {t("pagination.previous")}
            </Link>

            <span className={styles.pageInfo}>
                {t("pagination.page")} {page}
            </span>

            <Link
                className={styles.pageBtn}
                href={{
                    pathname: "/problems",
                    query: buildQuery(nextCursor),
                }}
            >
                {t("pagination.next")} →
            </Link>
        </div>
    );
}
