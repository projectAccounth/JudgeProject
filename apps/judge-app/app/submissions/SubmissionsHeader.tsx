"use client";

import { useTranslation } from "react-i18next";
import styles from "./Submissions.module.css";

export default function SubmissionsHeader() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className={styles.title}>{t("submissions.title")}</h1>
    </div>
  );
}
