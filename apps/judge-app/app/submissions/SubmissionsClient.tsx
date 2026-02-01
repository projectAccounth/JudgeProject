"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./Submissions.module.css";

interface SubmissionsClientProps {
    nextCursor?: string;
}

export default function SubmissionsClient({ nextCursor }: Readonly<SubmissionsClientProps>) {
    const { t } = useTranslation();

    if (!nextCursor) {
        return null;
    }

    return (
        <div className={styles.paginationContainer}>
                <Link href={`/submissions?cursor=${encodeURIComponent(nextCursor)}`} className={styles.loadMoreBtn}>
                {t("load_more")}
            </Link>
        </div>
    );
}
