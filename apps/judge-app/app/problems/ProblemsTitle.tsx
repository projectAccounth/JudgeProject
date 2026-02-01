"use client";

import { useTranslation } from "react-i18next";
import styles from "./Problems.module.css";

export default function ProblemsTitle() {
  const { t } = useTranslation();

  return <h1 className={styles.title}>{t("problems.title")}</h1>;
}
