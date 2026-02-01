"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "./Problems.module.css";

interface LoadMoreProps {
    q: string;
    difficulty: string;
    tags?: string[];
    category?: string[];
    nextCursor: string;
    since?: string;
}

export default function LoadMoreLink({
    q, difficulty,
    tags, category,
    nextCursor, since
}: Readonly<LoadMoreProps>) {
    const { t } = useTranslation();

    return (
        <Link
            className={styles.loadMore}
            href={{
                pathname: "/problems",
                query: {
                    q,
                    difficulty,
                    after: nextCursor,
                    since,
                    tags,
                    category,
                },
            }}
        >
            {t("load_more")}
        </Link>
    );
}
