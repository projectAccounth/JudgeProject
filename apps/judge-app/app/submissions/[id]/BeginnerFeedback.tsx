"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    analyzeCompilerErrors,
    generateFeedback,
    type BeginnerChecklistItem,
} from "@/app/lib/error-analyzer";
import { AIAnalysisBox } from "./AIAnalysisBox";
import styles from "./SubmissionDetail.module.css";
import { Submission } from "@judgeapp/shared/domain/submission";

interface AnalysisResult {
    feedback: string[];
    checklist: BeginnerChecklistItem[];
    passed: number;
    total: number;
    aiExplanation?: string;
    aiTip?: string;
    aiPassRate?: string;
}

async function analyzeSubmission(submission: Submission, userLanguage: string): Promise<AnalysisResult> {
    // Check if analysis is cached
    const cacheKey = `analysis_${submission.id}_${userLanguage}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            // Handle old cached format (string) vs new format (array)
            if (typeof parsed.feedback === "string") {
                parsed.feedback = [parsed.feedback];
            }
            return parsed;
        } catch {
            // Invalid cache, continue with fresh analysis
        }
    }

    // Get compiler/runtime errors from all failed test cases
    const allStderr = submission.result?.case_results
        ?.map((c) => c.stderr || "")
        .join("\n");

    const checklist = analyzeCompilerErrors(
        submission.language,
        allStderr || "",
        submission.result?.passed || 0,
        submission.result?.total || 0
    );

    // Generate base feedback (now returns keys)
    const feedbackKeys = generateFeedback(
        submission.result?.status || "UNKNOWN",
        submission.result?.passed || 0,
        submission.result?.total || 0,
        submission.result?.timeMs || 0,
        allStderr ? allStderr.includes("error") : false
    );

    let aiExplanation = "";
    let aiTip = "";
    let aiPassRate = "";

    // If no compiler errors and some tests failed, use Ollama for logic analysis
    const hasCompilerError = allStderr?.includes("error");
    const hasFailedTests = (submission.result?.passed ?? 0) < (submission.result?.total ?? 0);
    
    console.log("Analysis conditions:", {
        hasCompilerError,
        hasFailedTests,
        stderr: allStderr?.substring(0, 100),
        passed: submission.result?.passed,
        total: submission.result?.total,
        userLanguage,
    });

    if (!hasCompilerError && hasFailedTests) {
        try {
            const response = await fetch("/api/analyze-logic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceCode: submission.sourceCode,
                    language: submission.language,
                    testResults: submission.result,
                    targetLanguage: userLanguage,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                aiExplanation = data.explanation || "";
                aiTip = data.tip || "";
                aiPassRate = data.passRate || "";
                console.log("Ollama Analysis:", { explanation: aiExplanation, tip: aiTip, cached: data._cached });
            } else {
                const error = await response.text();
                console.error("Ollama API error:", response.status, error);
            }
        } catch (error) {
            console.error("Failed to analyze logic:", error);
        }
    }

    const result = { 
        feedback: feedbackKeys, 
        checklist, 
        aiExplanation,
        aiTip,
        aiPassRate,
        passed: submission.result?.passed || 0,
        total: submission.result?.total || 0
    };

    // Cache the result
    try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
        // Storage full or unavailable, continue without caching
    }

    return result;
}

export default function BeginnerFeedback({
    submission,
}: Readonly<{ submission: Submission }>) {
    const { t, i18n } = useTranslation();
    const [feedback, setFeedback] = useState<string>("");
    const [checklist, setChecklist] = useState<BeginnerChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiExplanation, setAiExplanation] = useState<string>("");
    const [aiTip, setAiTip] = useState<string>("");
    const [aiPassRate, setAiPassRate] = useState<string>("");

    // Prevent duplicate analysis calls when React runs effects multiple times
    const inFlightRef = useRef<string | null>(null);

    useEffect(() => {
        // Wait until i18n has initialized and provides a stable language
        if (!i18n?.isInitialized) return;

        (async () => {
            const currentLanguage = i18n.language || "en";
            const requestKey = `${submission?.id || ""}_${currentLanguage}`;

            // If the same request is already in-flight, skip starting another
            if (inFlightRef.current === requestKey) return;
            inFlightRef.current = requestKey;

            try {
                const {
                    feedback: fb,
                    checklist: cl,
                    passed: p,
                    total: tot,
                    aiExplanation: exp,
                    aiTip: tip,
                    aiPassRate: rate,
                } = await analyzeSubmission(submission, currentLanguage);

                // Translate feedback keys (AI analysis is now in the user's language)
                const translatedFeedback = fb
                    .map((key) => {
                        if (key.includes("feedback.some_failed")) {
                            return t("feedback.some_failed", { failed: tot - p });
                        }
                        return t(key, key);
                    })
                    .join(" ");

                setFeedback(translatedFeedback);
                setChecklist(cl);
                setAiExplanation(exp || "");
                setAiTip(tip || "");
                setAiPassRate(rate || "");
                console.log("Analysis complete:", { feedback: translatedFeedback, checklistLength: cl.length, language: currentLanguage });
            } catch (error) {
                console.error("Analysis error:", error);
                setFeedback(t("submission.no_issues"));
            } finally {
                inFlightRef.current = null;
                setLoading(false);
            }
        })();

        // Re-run when submission or language changes
    }, [submission, i18n?.language, i18n?.isInitialized, t]);

    if (loading) {
        return (
            <section className={styles.section}>
                <h2>{t("submission.beginner_tips")}</h2>
                <p className={styles.loading}>{t("submission.analyzing")}</p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h2>{t("submission.beginner_tips")}</h2>

            {/* AI Analysis Box - Now in the user's language */}
            {(aiExplanation || aiTip) && (
                <AIAnalysisBox 
                    explanation={aiExplanation}
                    tip={aiTip}
                    passRate={aiPassRate}
                />
            )}

            <div className={styles.feedbackBox}>
                {feedback && (
                    <div className={styles.feedbackSection}>
                        <p className={styles.feedbackText}>{feedback}</p>
                    </div>
                )}

                <div className={styles.checklist}>
                    <h3>{t("submission.common_mistakes")}</h3>
                    <ul className={styles.checklistItems}>
                        {checklist.map((item, idx) => {
                            const categoryKey = item.category
                                .toLowerCase()
                                .replace(/\s+/g, "_");
                            const translatedCategory = t(
                                `checklist.${categoryKey}`,
                                item.category
                            );
                            const translatedDescription = t(
                                item.description,
                                item.description
                            );

                            return (
                                <li
                                    key={idx}
                                    className={`${styles.checklistItem} ${
                                        item.found ? styles.found : ""
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.found}
                                        readOnly
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.category}>
                                        {translatedCategory}:
                                    </span>
                                    <span className={styles.description}>
                                        {translatedDescription}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
