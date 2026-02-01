"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./create.module.css";

export default function CreateContestPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        starts_at: "",
        ends_at: "",
        is_public: true,
    });

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (loading) {
        return <div className={styles.container}>{t("common.loading")}</div>;
    }

    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <p>{t("common.unauthorized")}</p>
                    <Link href="/contests" className={styles.button}>
                        {t("common.back")}
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // Validate form
            if (!formData.name.trim()) {
                throw new Error("Contest name is required");
            }
            if (!formData.starts_at) {
                throw new Error("Start time is required");
            }
            if (!formData.ends_at) {
                throw new Error("End time is required");
            }

            const startDate = new Date(formData.starts_at);
            const endDate = new Date(formData.ends_at);

            if (endDate <= startDate) {
                throw new Error("End time must be after start time");
            }

            const response = await fetch("/api/contests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || null,
                    starts_at: startDate.toISOString(),
                    ends_at: endDate.toISOString(),
                    is_public: formData.is_public,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = errorData?.error?.message || errorData?.message || "Failed to create contest";
                const errorCode = errorData?.error?.code || "UNKNOWN";
                throw new Error(`[${errorCode}] ${errorMsg}`);
            }

            const contest = await response.json();
            router.push(`/contests/${contest.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create contest");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Link href="/contests" className={styles.backButton}>
                        ← {t("common.back")}
                    </Link>
                    <h1 className={styles.title}>{t("contests.createTitle")}</h1>
                    <p className={styles.subtitle}>{t("contests.createSubtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    {/* Name Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>
                            {t("contests.name")} *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g., Spring 2026 Programming Contest"
                            className={styles.input}
                            disabled={submitting}
                        />
                    </div>

                    {/* Description Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.label}>
                            {t("contests.description")}
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Contest description and rules..."
                            className={styles.textarea}
                            rows={4}
                            disabled={submitting}
                        />
                    </div>

                    {/* Start Time Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="starts_at" className={styles.label}>
                            {t("contests.startTime")} *
                        </label>
                        <input
                            type="datetime-local"
                            id="starts_at"
                            value={formData.starts_at}
                            onChange={(e) =>
                                setFormData({ ...formData, starts_at: e.target.value })
                            }
                            className={styles.input}
                            disabled={submitting}
                        />
                    </div>

                    {/* End Time Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="ends_at" className={styles.label}>
                            {t("contests.endTime")} *
                        </label>
                        <input
                            type="datetime-local"
                            id="ends_at"
                            value={formData.ends_at}
                            onChange={(e) =>
                                setFormData({ ...formData, ends_at: e.target.value })
                            }
                            className={styles.input}
                            disabled={submitting}
                        />
                    </div>

                    {/* Public Toggle */}
                    <div className={styles.formGroup}>
                        <label htmlFor="is_public" className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={formData.is_public}
                                onChange={(e) =>
                                    setFormData({ ...formData, is_public: e.target.checked })
                                }
                                className={styles.checkbox}
                                disabled={submitting}
                            />
                            <span>{t("contests.public")}</span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={styles.submitButton}
                        >
                            {submitting ? t("common.loading") : t("contests.create")}
                        </button>
                        <Link href="/contests" className={styles.cancelButton}>
                            {t("common.cancel")}
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
