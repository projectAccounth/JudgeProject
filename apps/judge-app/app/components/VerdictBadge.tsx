import { useTranslation } from "react-i18next";
import styles from "./VerdictBadge.module.css";

interface VerdictBadgeProps {
    verdict: string;
    showTooltip?: boolean;
}

const VERDICT_COLORS: Record<string, { bg: string; text: string }> = {
    AC: { bg: "#10b981", text: "#ffffff" },
    WA: { bg: "#ef4444", text: "#ffffff" },
    RE: { bg: "#f59e0b", text: "#ffffff" },
    TLE: { bg: "#f59e0b", text: "#ffffff" },
    MLE: { bg: "#f59e0b", text: "#ffffff" },
    CE: { bg: "#6366f1", text: "#ffffff" },
    PENDING: { bg: "#6b7280", text: "#ffffff" },
    RUNNING: { bg: "#3b82f6", text: "#ffffff" }
};

export default function VerdictBadge({ verdict, showTooltip = true }: VerdictBadgeProps) {
    const { t } = useTranslation();
    const colors = VERDICT_COLORS[verdict] || VERDICT_COLORS.PENDING;
    const label = t(`verdicts.${verdict}`, verdict);
    const description = showTooltip ? t(`verdicts.${verdict}_desc`, "") : "";

    return (
        <div className={styles.wrapper} title={description}>
            <span
                className={styles.badge}
                style={{
                    backgroundColor: colors.bg,
                    color: colors.text
                }}
            >
                {label}
            </span>
            {showTooltip && description && (
                <div className={styles.tooltip}>{description}</div>
            )}
        </div>
    );
}
