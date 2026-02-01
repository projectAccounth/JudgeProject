import styles from "./Worker.module.css"

export function WorkerCard({ worker }: Readonly<{ worker: any }>) {
    let status = "OK";
    let color = "green";

    if (!worker.running) {
        status = "DOWN";
        color = "gray";
    } else if (worker.failures >= 3) {
        status = "UNHEALTHY";
        color = "red";
    } else if (worker.lastOutcome === "OOM") {
        status = "OOM";
        color = "red";
    } else if (worker.lastOutcome === "TLE") {
        status = "TLE";
        color = "amber";
    }

    return (
        <div className={styles.worker}>
            <div className={styles.workerHeader}>
                <span className={styles.workerId}>
                    {worker.containerId.slice(0, 12)}
                </span>
                <span
                    className={styles.badge}
                    data-color={color}
                >
                    {status}
                </span>
            </div>

            <div className={styles.workerMeta}>
                <div>
                    Failures: {worker.failures}
                </div>
                <div>
                    Last run:{" "}
                    {worker.lastRunAt
                        ? new Date(worker.lastRunAt).toLocaleTimeString()
                        : "never"}
                </div>
            </div>
        </div>
    );
}

export function SummaryCard({
    label,
    value,
    danger,
}: Readonly<{
    label: string;
    value: number;
    danger?: boolean;
}>) {
    return (
        <div
            className={`${styles.summaryCard} ${
                danger ? styles.danger : ""
            }`}
        >
            <div className={styles.summaryLabel}>
                {label}
            </div>
            <div className={styles.summaryValue}>
                {value}
            </div>
        </div>
    );
}

export function Stat({ label, value }: Readonly<{ label: string; value: number }>) {
    return (
        <div className={styles.stat}>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}
