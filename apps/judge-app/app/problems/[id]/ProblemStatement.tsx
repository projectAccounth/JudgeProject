"use client";

import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Tooltip from "@/app/components/Tooltip";
import "katex/dist/katex.css"
import styles from "./ProblemPage.module.css";

interface ProblemStatementProps {
    statement: string | null;
}

export default function ProblemStatement({ statement }: ProblemStatementProps) {
    const { t } = useTranslation();
    const descriptionTooltip = "This is the problem DESCRIPTION. Read it carefully to understand what you need to solve. Look at the samples below to see example inputs and outputs.";

    return (
        <div className={styles.content}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Problem Description</h3>
                <Tooltip content={descriptionTooltip} position="right">
                    <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        width: "18px", 
                        height: "18px", 
                        borderRadius: "50%", 
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#60a5fa",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "help"
                    }}>
                        ?
                    </span>
                </Tooltip>
            </div>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {statement || t("problem_detail.placeholder")}
            </ReactMarkdown>
        </div>
    );
}
