import { api } from "@/app/lib/api";
import styles from "./Worker.module.css";
import { LanguagePool } from "./LanguagePool";
import { SummaryCard } from "./SummaryCard";

export default async function WorkersPage() {
    const data = await api.getHealth();

    const pools = data.pools ?? [];

    const totalWorkers = pools.reduce(
        (sum: number, p: any) => sum + p.stats.total,
        0,
    );

    const unhealthy = pools.flatMap((p: any) =>
        p.workers.filter(
            (w: any) =>
                !w.running ||
                w.failures >= 3 ||
                w.lastOutcome === "OOM",
        ),
    ).length;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Worker Health</h1>

            <div className={styles.summary}>
                <SummaryCard
                    label="Total workers"
                    value={totalWorkers}
                />
                <SummaryCard
                    label="Languages"
                    value={pools.length}
                />
                <SummaryCard
                    label="Unhealthy"
                    value={unhealthy}
                    danger={unhealthy > 0}
                />
            </div>

            {pools.map((pool: any) => (
                <LanguagePool key={pool.language} pool={pool} />
            ))}
        </div>
    );
}
