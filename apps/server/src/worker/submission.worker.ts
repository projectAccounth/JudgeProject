import { Worker } from "bullmq";
import { SubmissionJob } from "../queue/jobs";
import { SubmissionExecutionService } from "../services/submission.service";

export function startSubmissionWorker(service: SubmissionExecutionService) {
    return new Worker<SubmissionJob>(
        "submissions",
        async job => {
            console.log("Executing", job.id);
            await service.execute(job.data.submissionId);
        },
        {
            connection: {
                host: "127.0.0.1",
                port: 6379
            },
            concurrency: 4,

            lockDuration: 300_000,      // 5 minutes
            stalledInterval: 30_000,    // check every 30s
            maxStalledCount: 1          // fail fast
        }
    );

}
