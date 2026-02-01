"use client";

import { useTranslation } from "react-i18next";
import Tooltip from "@/app/components/Tooltip";
import styles from "./SubmissionDetail.module.css";

interface CaseResult {
    index: number;
    input: string;
    status: string;
    stderr: string;
    stdout: string;
    timeMs: number;
    expected: string;
    memoryKb: number;
}

interface SubmissionResult {
    status: string;
    passed: number;
    total: number;
    timeMs: number;
    memoryKb: number;
    case_results: CaseResult[];
}

const VERDICT_EXPLANATIONS: Record<string, string> = {
    "AC": "Accepted - Your output matches the expected output for all test cases.",
    "WA": "Wrong Answer - Your output doesn't match the expected output. Check your solution logic.",
    "TLE": "Time Limit Exceeded - Your solution took too long. Optimize your algorithm.",
    "MLE": "Memory Limit Exceeded - Your solution used too much memory. Reduce memory usage.",
    "RE": "Runtime Error - Your program crashed or encountered an error. Check for edge cases.",
    "PENDING": "Your submission is waiting to be judged.",
    "RUNNING": "Your submission is currently being judged. Please wait..."
};

export default function ResultView({ result }: Readonly<{ result: SubmissionResult }>) {
    const { t } = useTranslation();
    const verdictExplanation = VERDICT_EXPLANATIONS[result.status] || "Unknown verdict";
    
    return (
        <section className={styles.section}>
            <h2>{t("results.result")}</h2>

            <div className={styles.resultRow}>
                <Tooltip content={verdictExplanation} position="bottom">
                    <span className={`${styles.pill} ${styles.verdict} ${styles[result.status]} ${styles.tooltipTrigger}`}>
                        {result.status}
                    </span>
                </Tooltip>

                <span className={styles.pill}>
                    {result.passed}/{result.total} {t("results.cases")}
                </span>

                <span className={styles.pill}>
                    {result.timeMs} {t("results.ms")}
                </span>

                <span className={styles.pill}>
                    {result.memoryKb} {t("results.kb")}
                </span>
            </div>

            <details className={styles.cases}>
                <summary>{t("results.test_cases")}</summary>

                {result.case_results.map((c) => (
                    <div key={c.index} className={styles.case}>
                        <div className={styles.caseHeader}>
                            <span className={styles.pill}>{t("results.test_cases")} #{c.index}</span>
                            <Tooltip content={VERDICT_EXPLANATIONS[c.status] || "Test case result"} position="left">
                                <span className={`${styles.pill} ${styles.verdict} ${styles[c.status]} ${styles.tooltipTrigger}`}>
                                    {c.status}
                                </span>
                            </Tooltip>
                        </div>

                        {c.status !== "AC" && (
                            <div className={styles.outputSections}>
                                {c.expected && (
                                    <div className={`${styles.outputBox} ${styles.outputBoxExpected}`}>
                                        <div className={styles.outputBoxLabel}>
                                            <span className={styles.outputIcon}>✓</span>
                                            {t("results.expected")}
                                        </div>
                                        <div className={styles.outputBoxContent}>{c.expected}</div>
                                    </div>
                                )}

                                {c.stdout && (
                                    <div className={`${styles.outputBox} ${styles.outputBoxActual}`}>
                                        <div className={styles.outputBoxLabel}>
                                            <span className={styles.outputIcon}>▶</span>
                                            {t("results.your_output")}
                                        </div>
                                        <div className={styles.outputBoxContent}>{c.stdout}</div>
                                    </div>
                                )}

                                {c.stderr && (
                                    <div className={`${styles.outputBox} ${styles.outputBoxStderr}`}>
                                        <div className={styles.outputBoxLabel}>
                                            <span className={styles.outputIcon}>⚠</span>
                                            {t("results.error")}
                                        </div>
                                        <div className={styles.outputBoxContent}>{c.stderr}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </details>
        </section>
    );
}
