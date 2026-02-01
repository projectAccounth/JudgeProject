import { SubmissionRepository } from "@judgeapp/shared/domain/submission";
import { SubmissionExecutionService } from "../../services/submission.service";

export class SubmissionScheduler {
    private readonly inflight = new Map<string, Promise<void>>();
    private readonly workerId = crypto.randomUUID();
    private timer: NodeJS.Timeout | null = null;
    private recoverTimer: NodeJS.Timeout | null = null;

    private readonly STUCK_RECOVERY_TIMEOUT_MS = 5 * 60 * 1000;
    private readonly RUN_TASK_INTERVAL_MS = 1000;

    constructor(
        private readonly repo: SubmissionRepository,
        private readonly executor: SubmissionExecutionService,
        private readonly concurrency: number
    ) {}

    start(): void {
        this.recoverTimer ??= setInterval(async () => {
            const recovered = await this.repo.recoverInvalid(this.STUCK_RECOVERY_TIMEOUT_MS);

            if (recovered.length > 0) {
                console.warn(
                    `Recovered ${recovered.length} submissions`
                );
            }
        }, 60_000);

        this.timer ??= setInterval(() => {
            this.tick().catch(err =>
                console.error("Scheduler tick failed", err)
            );
        }, this.RUN_TASK_INTERVAL_MS);
    }

    stop(): void {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }

    private async tick(): Promise<void> {
        const capacity = this.concurrency - this.inflight.size;
        if (capacity <= 0) return;

        const claimed = await this.repo.claimPendingBatch(
            capacity,
            this.workerId
        );

        for (const sub of claimed) {
            const p = this.executor.execute(sub.id)
                .catch(err => {
                    console.error("Execution failed", sub.id, err);
                })
                .finally(() => {
                    this.inflight.delete(sub.id);
                });

            this.inflight.set(sub.id, p);
        }
    }
}
