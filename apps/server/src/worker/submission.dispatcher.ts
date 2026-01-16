import { SqlSubmissionRepository } from "../repositories/sql/submission.repository.sql";
import { SubmissionExecutionService } from "../services/submission.service";

export function startSqlDispatcher(
    repo: SqlSubmissionRepository,
    executor: SubmissionExecutionService
) {
    const WORKER_ID = crypto.randomUUID();
    const INTERVAL_MS = 1000;
    const BATCH_SIZE = 4;

    setInterval(async () => {
        const claimed =
            await repo.claimPendingBatch(
                BATCH_SIZE,
                WORKER_ID
            );

        for (const sub of claimed) {
            executor
                .execute(sub.id)
                .catch((err: any) => {
                    console.error(
                        "Execution failed",
                        err
                    );
                });
        }
    }, INTERVAL_MS);
}
