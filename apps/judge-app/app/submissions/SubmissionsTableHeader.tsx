"use client";

import { useTranslation } from "react-i18next";
import styles from "./Submissions.module.css";

export default function SubmissionsTableHeader() {
  const { t } = useTranslation();
  
  return (
    <thead>
      <tr>
        <th>{t("table.id")}</th>
        <th>{t("table.user")}</th>
        <th>{t("table.problem")}</th>
        <th>{t("table.verdict")}</th>
        <th>{t("table.language")}</th>
        <th>{t("table.when")}</th>
      </tr>
    </thead>
  );
}
