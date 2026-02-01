"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./TopBar.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopBar() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 2. RETURN MINIMAL HTML ON SERVER
    if (!mounted) {
        return (
            <header className={styles.bar}>
                <div className={styles.inner}>
                    <div className={styles.left}>
                        <Link href="/" className={styles.brand}>
                            <Image src="/logo.jpg" alt="Judge" width={22} height={22} />
                        </Link>
                    </div>
                    {/* Render empty nav/user area to keep layout consistent */}
                    <nav className={styles.nav}></nav>
                    <div className={styles.user}></div>
                </div>
            </header>
        );
    }
    
    return (
        <header className={styles.bar} suppressHydrationWarning>
            <div className={styles.inner} suppressHydrationWarning>
                {/* Left cell: Brand */}
                <div className={styles.left}>
                    <Link href="/" className={styles.brand}>
                        <Image src={"/logo.jpg"} alt="Judge" width={22} height={22} />
                    </Link>
                </div>

                {/* Middle cell: Navigation */}
                <nav className={styles.nav} suppressHydrationWarning>
                    <Link href="/problems" className={styles.link}>
                        {t("nav.problems")}
                    </Link>
                    <Link href="/submissions" className={styles.link}>
                        {t("nav.submissions")}
                    </Link>
                    <Link href="/contests" className={styles.link}>
                        {t("contests.title")}
                    </Link>
                    <Link href="/users" className={styles.link}>
                        {t("nav.users")}
                    </Link>
                    <Link href="/stats" className={styles.link}>
                        {t("nav.statistics")}
                    </Link>
                    <Link href="/about" className={styles.link}>
                        {t("nav.about")}
                    </Link>
                </nav>
                
                {/* Right */}
                <div className={styles.user} suppressHydrationWarning>
                    <LanguageSwitcher />

                    {/* Role-specific panel access */}
                    {user?.role === "ADMIN" && (
                        <div className={styles.roleMenu}>
                            <Link href="/admin" className={styles.roleLink}>
                                {t("nav.admin")}
                            </Link>
                            <div className={styles.roleSubmenu}>
                                <Link href="/admin/guides" className={styles.roleSubmenuItem}>
                                    📖 {t("guide.adminTeacherGuide")}
                                </Link>
                            </div>
                        </div>
                    )}
                    {user?.role === "TEACHER" && (
                        <div className={styles.roleMenu}>
                            <Link href="/teacher" className={styles.roleLink}>
                                {t("nav.teacher")}
                            </Link>
                            <div className={styles.roleSubmenu}>
                                <Link href="/teacher/guides" className={styles.roleSubmenuItem}>
                                    📖 {t("guide.adminTeacherGuide")}
                                </Link>
                            </div>
                        </div>
                    )}

                    {user ? (
                        <div className={styles.profile}>
                            <span className={styles.username}>
                                {user.username || user.id}
                            </span>
                            <div className={styles.dropdown}>
                                <Link href="/me">{t("nav.profile")}</Link>
                                <Link href="/logout">{t("nav.logout")}</Link>
                            </div>
                        </div>
                    ) : (
                        !loading ? (
                            <div className={styles.buttonGroup} role="tablist">
                                <Link
                                    href="/login"
                                    role="tab"
                                    aria-selected={pathname === "/login"}
                                    className={`${styles.button} ${pathname === "/login" ? styles.active : ""
                                    }`}
                                >
                                    {t("nav.login")}
                                </Link>

                                <Link
                                    href="/register"
                                    role="tab"
                                    aria-selected={pathname === "/register"}
                                    className={`${styles.button} ${pathname === "/register" ? styles.active : ""
                                    }`}
                                >
                                    {t("nav.register")}
                                </Link>
                            </div>
                        ) : null
                    )}
                </div>
            </div>
        </header>
    );
}
