import { createWorkerContainer } from "./worker/container";
import { submissionQueue } from "./queue/submission.queue";
import { startSqlDispatcher } from "./worker/submission.dispatcher";

async function main() {
    const { submissionService, submissionRepo } = createWorkerContainer();
    startSqlDispatcher(submissionRepo, submissionService);
    console.log("Submission worker started");

    submissionQueue.on("error", console.error);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
