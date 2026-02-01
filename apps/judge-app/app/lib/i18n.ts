import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "../../public/locales/en/translation.json";
import frTranslation from "../../public/locales/fr/translation.json";
import deTranslation from "../../public/locales/de/translation.json";
import cnTranslation from "../../public/locales/cn/translation.json";
import viTranslation from "../../public/locales/vi/translation.json";

const resources = {
    en: { translation: enTranslation },
    fr: { translation: frTranslation },
    de: { translation: deTranslation },
    cn: { translation: cnTranslation },
    vi: { translation: viTranslation },
};

i18n
    .use(LanguageDetector)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
    });

export default i18n;
