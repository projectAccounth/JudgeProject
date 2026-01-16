import { SqlSubmissionRepository } from "../repositories/sql/submission.repository.sql";

export function startStuckRecovery(
    repo: SqlSubmissionRepository
) {
    const TIMEOUT_MS = 5 * 60 * 1000;

    setInterval(async () => {
        const stuck =
            await repo.findStuckRunning(TIMEOUT_MS);

        for (const sub of stuck) {
            console.warn(
                "Recovering stuck submission",
                sub.id
            );

            await repo.resetToPending(sub.id);
        }
    }, 60_000);
}
