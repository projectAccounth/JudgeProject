"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import CodeEditor from "./CodeEditor";
import { useRouter } from "next/navigation";
import styles from "./SubmissionForm.module.css";
import { ServerError } from "../lib/types";
import { useAuth } from "../context/AuthContext";

const MONACO_LANG: Record<string, string> = {
    cpp: "cpp",
    python: "python",
    js: "javascript",
};

const DEFAULT_TEMPLATES: Record<string, string> = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`,
    python: `def main():
    pass

if __name__ == "__main__":
    main()
`,
    js: `function main() {

}

main();
`,
};

export default function SubmissionForm({ problemId }: Readonly<{ problemId: string }>) {
    const { t } = useTranslation();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [language, setLanguage] = useState("python");
    const [sourceCode, setSourceCode] = useState(DEFAULT_TEMPLATES["python"]);
    const [error, setError] = useState<string | null>(null);
    const { user, loading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const lastSubmitTimeRef = useRef<number>(0);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);

    const MAX_FILE_SIZE = 500 * 1024; // 500 KB
    const SUBMIT_THROTTLE_MS = 1000; // Minimum 1 second between submissions

    // Load saved submission from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(`submission_draft_${problemId}`);
        if (savedDraft) {
            try {
                const { sourceCode: savedCode, language: savedLang } = JSON.parse(savedDraft);
                setSourceCode(savedCode);
                setLanguage(savedLang);
                setIsDraftLoaded(true);
            } catch (err) {
                console.error("Failed to load saved submission:", err);
            }
        }
    }, [problemId]);

    function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setError(t("submission_form.file_too_large", { size: MAX_FILE_SIZE / 1024 }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                setSourceCode(content);
                setError(null);
            } catch (err) {
                setError(t("submission_form.failed_to_read") + err);
            }
        };
        reader.onerror = () => {
            setError(t("submission_form.failed_to_read"));
        };
        reader.readAsText(file);

        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function submit() {
        setError(null);

        if (loading || !user) return;

        // Client-side throttling: prevent rapid-fire submissions
        const now = Date.now();
        if (now - lastSubmitTimeRef.current < SUBMIT_THROTTLE_MS) {
            setError(t("submission_form.please_wait") || "Please wait before submitting again");
            return;
        }

        // Prevent concurrent submissions
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        lastSubmitTimeRef.current = now;

        try {
            const res = await api.submitSolution({
                problemId: problemId,
                sourceCode: sourceCode,
                language: language,
                userId: user.id,
            });

            // Clear the saved draft after successful submission
            localStorage.removeItem(`submission_draft_${problemId}`);
            router.push(`/submissions/${res.id}`);
        } catch (e: unknown) {
            setError((e as ServerError).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className={styles.wrapper}>
            <div className={styles.panel}>
                <h2 className={styles.heading}>{t("submission_form.submit_solution")}</h2>

                <div className={styles.editor}>
                    <CodeEditor
                        value={sourceCode}
                        language={MONACO_LANG[language]}
                        onChange={setSourceCode}
                    />
                </div>

                <div className={styles.footer}>
                    <select
                        value={language}
                        onChange={(e) => {
                            setLanguage(e.target.value);
                            setSourceCode(DEFAULT_TEMPLATES[e.target.value] ?? "");
                        }}
                        className={styles.select}
                    >
                        <option value="python">{t("submission_form.python")}</option>
                        <option value="cpp">{t("submission_form.cpp")}</option>
                        <option value="js">{t("submission_form.javascript")}</option>
                    </select>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.submit}
                    >
                        {t("submission_form.load_file")}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.cpp,.py,.js,.c,.h,.hpp"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />

                    <button onClick={submit} className={styles.submit} disabled={isSubmitting || loading}>
                        {isSubmitting ? t("submission_form.submitting") || "Submitting..." : t("submission_form.submit")}
                    </button>

                    {isDraftLoaded && (
                        <span style={{ color: "#10b981", fontSize: "14px", marginTop: "8px", display: "block" }}>
                            ✓ Previous submission loaded - ready to adjust
                        </span>
                    )}

                    {error && <span className={styles.error}>{error}</span>}
                </div>
            </div>
        </section>
    );
}
