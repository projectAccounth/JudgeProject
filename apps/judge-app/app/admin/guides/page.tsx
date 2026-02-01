"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "./guides.module.css";

export default function AdminGuidePage() {
    const { t } = useTranslation();
    const guide = t("guide.adminGuide") as Record<string, string>;

    const sections = [
        { key: "section_1" },
        { key: "section_2" },
        { key: "section_3" },
        { key: "section_4" },
        { key: "section_5" },
    ];

    return (
        <main className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t("guide.adminTeacherGuide")}</h1>
                    <p className={styles.subtitle}>{t("guide.adminGuideDesc")}</p>
                </div>
                <Link href="/admin" className={styles.ctaButton}>
                    {t("guide.goToAdminPanel")} →
                </Link>
            </div>

            {/* Quick Navigation */}
            <div className={styles.quickNav}>
                <h3>{t("guide.quickNavigation")}</h3>
                <nav className={styles.navLinks}>
                    {sections.map((section) => (
                        <a key={section.key} href={`#${section.key}`} className={styles.navLink}>
                            {guide[`${section.key}_title`]}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Sections */}
            <div className={styles.content}>
                {sections.map((section) => (
                    <section key={section.key} id={section.key} className={styles.section}>
                        <h2 className={styles.sectionTitle}>{guide[`${section.key}_title`]}</h2>
                        <p className={styles.sectionDesc}>{guide[`${section.key}_desc`]}</p>

                        <div className={styles.sectionContent}>
                            {Array.from({ length: 10 }).map((_, i) => {
                                const key = `${section.key}_p${i + 1}`;
                                const text = guide[key];
                                return text ? (
                                    <p key={key} className={styles.sectionPoint}>
                                        {text}
                                    </p>
                                ) : null;
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {/* Help Section */}
            <div className={styles.helpBox}>
                <h3>{t("guide.needMoreHelp")}</h3>
                <p>{t("guide.helpDescription")}</p>
                <div className={styles.helpLinks}>
                    <Link href="/about" className={styles.helpLink}>
                        {t("guide.viewMainGuide")}
                    </Link>
                    <Link href="/teacher/guides" className={styles.helpLink}>
                        {t("guide.teacherGuideDesc")} →
                    </Link>
                </div>
            </div>

            {/* Back Button */}
            <div className={styles.footer}>
                <Link href="/admin" className={styles.backButton}>
                    ← {t("guide.goToAdminPanel")}
                </Link>
            </div>
        </main>
    );
}
