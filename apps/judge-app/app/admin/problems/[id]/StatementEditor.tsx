"use client";

import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";
import styles from "./StatementEditor.module.css";

export default function StatementEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const { t } = useTranslation();
    return (
        <div className={styles.wrapper}>
            <div className={styles.editor}>
                <div className={styles.header}>{t("admin.statementEditor.markdown")}</div>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Write the problem statement in Markdown. Use $x^2$ for math."
                />
            </div>

            <div className={styles.preview}>
                <div className={styles.header}>{t("admin.statementEditor.preview")}</div>
                <div className={styles.content}>
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {value || "_Nothing to preview yet._"}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
