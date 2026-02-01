"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Auth.module.css";

export default function LoginPage() {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const form = new FormData(e.currentTarget);

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: form.get("username"),
                password: form.get("password")
            })
        });

        if (!res.ok) {
            setError(t("auth.invalid"));
            return;
        }

        window.location.href = "/";
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <header className={styles.header}>
                    <h1>{t("auth.login")}</h1>
                    <p>{t("auth.loginHint")}</p>
                </header>

                <form onSubmit={onSubmit} className={styles.form}>
                    <input
                        name="username"
                        placeholder={t("auth.username")}
                        autoFocus
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder={t("auth.password")}
                        required
                    />

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit">
                        {t("auth.login")}
                    </button>
                </form>

                <footer className={styles.footer}>
                    <span>{t("auth.noAccount")}</span>
                    <Link href="/register">
                        {t("auth.register")}
                    </Link>
                </footer>
            </section>
        </main>
    );
}
