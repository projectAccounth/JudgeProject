"use client";

import { useTranslation } from "react-i18next";
import styles from "./ProblemPage.module.css";

export default function ProblemStatementHeader() {
    const { t } = useTranslation();

    return <h2>{t("problem_detail.statement")}</h2>;
}
