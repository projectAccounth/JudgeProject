import { createWorkerContainer } from "./worker/submission/container";
import { startSqlDispatcher } from "./worker/submission/submission.dispatcher";

async function main() {
    const { submissionService, submissionRepo } = createWorkerContainer();
    startSqlDispatcher(submissionRepo, submissionService);
    console.log("Submission worker started");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
