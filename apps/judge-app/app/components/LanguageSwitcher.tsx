"use client";

import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { code: "en", name: "English" },
        { code: "fr", name: "Français" },
        { code: "de", name: "Deutsch" },
        { code: "cn", name: "中文" },
        { code: "vi", name: "Tiếng Việt" },
    ];

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className={styles.languageSwitcher}>
            <select 
                value={i18n.language} 
                onChange={handleLanguageChange}
                className={styles.select}
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
