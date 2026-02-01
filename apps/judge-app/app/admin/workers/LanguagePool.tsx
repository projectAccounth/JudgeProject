import { Stat, WorkerCard } from "./SummaryCard";
import styles from "./Worker.module.css"

export function LanguagePool({ pool }: Readonly<{ pool: any }>) {
    return (
        <section className={styles.pool}>
            <div className={styles.poolHeader}>
                <h2>{pool.language.toUpperCase()}</h2>

                <div className={styles.stats}>
                    <Stat label="Idle: " value={pool.stats.idle} />
                    <Stat label="Busy: " value={pool.stats.busy} />
                    <Stat label="Total: " value={pool.stats.total} />
                </div>
            </div>

            <div className={styles.workerGrid}>
                {pool.workers.map((w: any, i: number) => (
                    <WorkerCard key={i} worker={w} />
                ))}
            </div>
        </section>
    );
}
