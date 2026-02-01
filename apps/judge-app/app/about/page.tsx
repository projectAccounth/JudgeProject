"use client";

import { useTranslation } from "react-i18next";
import styles from "./about.module.css";

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>{t("about.title")}</h1>
                    <p className={styles.tagline}>{t("about.tagline")}</p>
                </div>
            </section>

            {/* Main Content */}
            <div className={styles.container}>
                {/* Section 1: What is CodeFix AI */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("about.section1Title")}</h2>
                    <p className={styles.sectionContent}>{t("about.section1Content")}</p>
                </section>

                {/* Section 2: Features */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("about.section2Title")}</h2>
                    <div className={styles.grid}>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>📚</div>
                            <p>{t("about.feature1")}</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>💻</div>
                            <p>{t("about.feature2")}</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>⚡</div>
                            <p>{t("about.feature3")}</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>🏆</div>
                            <p>{t("about.feature4")}</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>📊</div>
                            <p>{t("about.feature5")}</p>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureIcon}>👨‍🏫</div>
                            <p>{t("about.feature6")}</p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Getting Started */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("about.section3Title")}</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <p>{t("about.step1")}</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <p>{t("about.step2")}</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <p>{t("about.step3")}</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>4</div>
                            <p>{t("about.step4")}</p>
                        </div>
                    </div>
                </section>

                {/* Section 4: For Teachers */}
                <section className={styles.section + " " + styles.highlight}>
                    <h2 className={styles.sectionTitle}>{t("about.section4Title")}</h2>
                    <p className={styles.sectionContent}>{t("about.teacherContent")}</p>
                </section>

                {/* Contact Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("about.contactTitle")}</h2>
                    <p className={styles.sectionContent}>{t("about.contactContent")}</p>
                </section>
            </div>
        </div>
    );
}
