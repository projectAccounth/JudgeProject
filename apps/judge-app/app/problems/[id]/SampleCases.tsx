"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Tooltip from "@/app/components/Tooltip";
import styles from "./SampleCases.module.css";
import { TestCase } from "@judgeapp/shared/domain/testcase";

function copy(text: string) {
    navigator.clipboard.writeText(text);
}

export default function SampleCases({ samples }: Readonly<{ samples: TestCase[] }>) {
    const { t } = useTranslation();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number, isOutput: boolean) => {
        copy(text);
        setCopiedIndex(index * 2 + (isOutput ? 1 : 0));
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const inputTooltip = "This is the INPUT data your program will receive. Use this to test and understand the problem.";
    const outputTooltip = "This is the EXPECTED OUTPUT. Your program's output should match this exactly for the test case to pass. This is NOT your program's output—it's what the correct solution should produce.";

    return (
        <section className={styles.section}>
            <h2>{t("sample_cases.title")}</h2>

            <div className={styles.list}>
                {samples
                    .toSorted((a, b) => a.order - b.order)
                    .map((s, i) => (
                        <div key={s.id} className={styles.sample}>
                            <div className={styles.header}>
                                <span>{t("sample_cases.sample")} #{i + 1}</span>
                            </div>

                            <div className={styles.io}>
                                <div className={styles.block}>
                                    <div className={styles.blockHeader}>
                                        <Tooltip content={inputTooltip} position="right">
                                            <span className={styles.tooltipTrigger}>{t("sample_cases.input")}</span>
                                        </Tooltip>
                                        <button
                                            onClick={() => handleCopy(s.input, i, false)}
                                            className={styles.copy}
                                        >
                                            {copiedIndex === i * 2 ? t("sample_cases.copied") : t("sample_cases.copy")}
                                        </button>
                                    </div>
                                    <pre>{s.input}</pre>
                                </div>

                                <div className={styles.block}>
                                    <div className={styles.blockHeader}>
                                        <Tooltip content={outputTooltip} position="right">
                                            <span className={styles.tooltipTrigger}>{t("sample_cases.output")}</span>
                                        </Tooltip>
                                        <button
                                            onClick={() => handleCopy(s.expectedOutput, i, true)}
                                            className={styles.copy}
                                        >
                                            {copiedIndex === i * 2 + 1 ? t("sample_cases.copied") : t("sample_cases.copy")}
                                        </button>
                                    </div>
                                    <pre>{s.expectedOutput}</pre>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </section>
    );
}
