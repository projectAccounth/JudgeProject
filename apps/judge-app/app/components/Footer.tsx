"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./Footer.module.css";

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Branding and description */}
                    <div className={styles.section}>
                        <h3 className={styles.title}>CodeFix AI</h3>
                        <p className={styles.description}>
                            An online judge platform for competitive programming and learning
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.section}>
                        <h4 className={styles.subtitle}>Quick Links</h4>
                        <ul className={styles.links}>
                            <li>
                                <Link href="/problems">{t("nav.problems")}</Link>
                            </li>
                            <li>
                                <Link href="/submissions">{t("nav.submissions")}</Link>
                            </li>
                            <li>
                                <Link href="/stats">{t("nav.statistics")}</Link>
                            </li>
                            <li>
                                <Link href="/about">{t("nav.about")}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className={styles.section}>
                        <h4 className={styles.subtitle}>Resources</h4>
                        <ul className={styles.links}>
                            <li>
                                <Link href="/users">{t("nav.users")}</Link>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    Community
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Stats */}
                    <div className={styles.section}>
                        <h4 className={styles.subtitle}>Connect</h4>
                        <ul className={styles.links}>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    Discord - Technical Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} CodeFix AI. All rights reserved.
                    </p>
                    <div className={styles.legalLinks}>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            Privacy Policy
                        </a>
                        <span className={styles.divider}>•</span>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            Terms of Service
                        </a>
                        <span className={styles.divider}>•</span>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
