import { useTranslation } from "react-i18next";
import styles from "./SubmissionDetail.module.css";

interface AIAnalysisBoxProps {
    explanation: string;
    tip: string;
    passRate?: string;
}

export function AIAnalysisBox({ explanation, tip, passRate }: Readonly<AIAnalysisBoxProps>) {
    const { t } = useTranslation();
    if (!explanation && !tip) {
        return null;
    }

    return (
        <div className={styles.aiAnalysisBox}>
            <div className={styles.aiHeader}>
                <span className={styles.aiIcon}>🤖</span>
                <h3>{t("analysis.analysis_title")}</h3>
                {passRate && <span className={styles.passRate}>{passRate}</span>}
            </div>

            {explanation && (
                <div className={styles.aiSection}>
                    <h4>{t("analysis.current_problem")}</h4>
                    <p className={styles.aiExplanation}>{explanation}</p>
                </div>
            )}

            {tip && (
                <div className={styles.aiSection}>
                    <h4>{t("analysis.hint")}</h4>
                    <p className={styles.aiTip}>{tip}</p>
                </div>
            )}
        </div>
    );
}
