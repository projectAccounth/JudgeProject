"use client"
import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./TeacherLayout.module.css";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useTranslation();
    return (
        <div className={styles.root}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    Teacher Panel
                </div>

                <nav className={styles.nav}>
                    <Section title="Content">
                        <NavLink href="/teacher">
                            {t("teacher.nav.myProblems")}
                        </NavLink>
                        <NavLink href="/teacher/create">
                            Create Problem
                        </NavLink>
                    </Section>

                    <Section title="Students">
                        <NavLink href="/teacher/submissions">
                            {t("teacher.nav.studentSubmissions")}
                        </NavLink>
                        <NavLink href="/teacher/analytics">
                            {t("teacher.nav.analytics")}
                        </NavLink>
                    </Section>
                </nav>
            </aside>

            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                {title}
            </div>
            {children}
        </div>
    );
}

function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link href={href} className={styles.link}>
            {children}
        </Link>
    );
}
