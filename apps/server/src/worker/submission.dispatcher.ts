import { SqlSubmissionRepository } from "../repositories/sql/submission.repository.sql";
import { SubmissionExecutionService } from "../services/submission.service";

export function startSqlDispatcher(
    repo: SqlSubmissionRepository,
    executor: SubmissionExecutionService
) {
    const inflight = new Map<string, Promise<void>>();

    const WORKER_ID = crypto.randomUUID();
    const INTERVAL_MS = 1000;
    const BATCH_SIZE = 4;

    setInterval(async () => {
        if (inflight.size >= BATCH_SIZE) {
            return;
        }

        const capacity = BATCH_SIZE - inflight.size;

        const claimed = await repo.claimPendingBatch(
            capacity,
            WORKER_ID
        );

        for (const sub of claimed) {
            const p = executor.execute(sub.id)
                .catch((err: any) => {
                    console.error("Execution failed", err);
                })
                .finally(() => {
                    inflight.delete(sub.id);
                });

            inflight.set(sub.id, p);
        }
    }, INTERVAL_MS);
}
