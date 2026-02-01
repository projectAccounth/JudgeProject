"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import styles from "./Problems.module.css";

interface ProblemsFilterProps {
    q: string;
    difficulty: string;
    tags: string;
    category: string;
}

export default function ProblemsFilter({ q, difficulty, tags, category }: ProblemsFilterProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const params = new URLSearchParams();
        
        const queryValue = (formData.get("q") as string)?.trim();
        if (queryValue) params.set("q", queryValue);
        
        const diffValue = (formData.get("difficulty") as string)?.trim();
        if (diffValue) params.set("difficulty", diffValue);
        
        const tagsValue = (formData.get("tags") as string)?.trim();
        if (tagsValue) params.set("tags", tagsValue);
        
        const categoryValue = (formData.get("category") as string)?.trim();
        if (categoryValue) params.set("category", categoryValue);

        const queryString = params.toString();
        router.push(`/problems${queryString ? "?" + queryString : ""}`);
    };

    return (
        <form className={styles.controls} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <input
                    name="q"
                    placeholder={t("problems.search_placeholder")}
                    defaultValue={q}
                />
            </div>

            <div className={styles.field}>
                <input
                    name="tags"
                    placeholder={t("problems.tags_placeholder")}
                    defaultValue={tags}
                />
            </div>

            <div className={styles.field}>
                <input
                    name="category"
                    placeholder={t("problems.category_placeholder")}
                    defaultValue={category}
                />
            </div>

            <div className={styles.field}>
                <select
                    name="difficulty"
                    defaultValue={difficulty}
                >
                    <option value="">{t("problems.all_difficulties")}</option>
                    <option value="EASY">{t("problems.easy")}</option>
                    <option value="MEDIUM">{t("problems.medium")}</option>
                    <option value="HARD">{t("problems.hard")}</option>
                </select>
            </div>

            <button type="submit" className={styles.apply}>
                {t("problems.apply")}
            </button>
        </form>
    );
}
