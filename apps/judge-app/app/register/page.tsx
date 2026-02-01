"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../login/Auth.module.css";

export default function RegisterPage() {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const username = form.get("username");
        const password = form.get("password");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            // After successful register → go to login
            window.location.href = "/login";
        } catch (err) {
            setError(t("auth.registerFailed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <header className={styles.header}>
                    <h1>{t("auth.register")}</h1>
                    <p>{t("auth.registerHint")}</p>
                </header>

                <form onSubmit={onSubmit} className={styles.form}>
                    <input
                        name="username"
                        placeholder={t("auth.username")}
                        required
                        autoFocus
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder={t("auth.password")}
                        required
                    />

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? t("auth.loading") : t("auth.register")}
                    </button>
                </form>

                <footer className={styles.footer}>
                    <span>{t("auth.haveAccount")}</span>
                    <Link href="/login">
                        {t("auth.login")}
                    </Link>
                </footer>
            </section>
        </main>
    );
}
