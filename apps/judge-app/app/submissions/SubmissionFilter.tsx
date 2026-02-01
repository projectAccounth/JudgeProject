"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import styles from "./Submissions.module.css";

interface SubmissionFilterProps {
    verdict?: string;
    language?: string;
    problemId?: string;
}

export default function SubmissionFilter({ verdict, language, problemId }: Readonly<SubmissionFilterProps>) {
    const { t } = useTranslation();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const params = new URLSearchParams();

        const verdictValue = (formData.get("verdict") as string)?.trim();
        if (verdictValue) params.set("verdict", verdictValue);

        const languageValue = (formData.get("language") as string)?.trim();
        if (languageValue) params.set("language", languageValue);

        const problemIdValue = (formData.get("problemId") as string)?.trim();
        if (problemIdValue) params.set("problemId", problemIdValue);

        const queryString = params.toString();
        router.push(`/submissions${queryString ? "?" + queryString : ""}`);
    };

    return (
        <form className={styles.filterForm} onSubmit={handleSubmit}>
            <div className={styles.filterField}>
                <input
                    name="problemId"
                    placeholder={t("table.problem")}
                    defaultValue={problemId}
                />
            </div>

            <div className={styles.filterField}>
                <select name="language" defaultValue={language}>
                    <option value="">{t("submissions.all_languages")}</option>
                    <option value="python">{t("submissionFilter.languages.python")}</option>
                    <option value="cpp">{t("submissionFilter.languages.cpp")}</option>
                    <option value="java">{t("submissionFilter.languages.java")}</option>
                    <option value="javascript">{t("submissionFilter.languages.javascript")}</option>
                </select>
            </div>

            <div className={styles.filterField}>
                <select name="verdict" defaultValue={verdict}>
                    <option value="">{t("submissions.all_verdicts")}</option>
                    <option value="AC">{t("submissionFilter.verdicts.ac")}</option>
                    <option value="WA">{t("submissionFilter.verdicts.wa")}</option>
                    <option value="RE">{t("submissionFilter.verdicts.re")}</option>
                    <option value="TLE">{t("submissionFilter.verdicts.tle")}</option>
                    <option value="MLE">{t("submissionFilter.verdicts.mle")}</option>
                    <option value="CE">{t("submissionFilter.verdicts.ce")}</option>
                </select>
            </div>

            <button type="submit" className={styles.filterBtn}>
                {t("problems.apply")}
            </button>
        </form>
    );
}
