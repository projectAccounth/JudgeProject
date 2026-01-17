import { DockerJudge } from "../../judge/docker/docker-judge";
import { SubmissionExecutionService } from "../../services/submission.service";
import { SqlProblemRepository } from "../../repositories/sql/problem.repository.sql";
import { SqlSubmissionRepository } from "../../repositories/sql/submission.repository.sql";
import { SqlTestCaseRepository } from "../../repositories/sql/testcase.repository.sql";
import { startStuckRecovery } from "./submission.recovery";
import { LanguagePools, languagePools } from "./docker/pool.languages";

function registerShutdown(pools: LanguagePools): void {
    const cleanup = async () => {
        console.log("Cleaning up Docker workers...");
        const workers = pools.getAllWorkers();

        await Promise.allSettled(
            workers.map(w => w.dispose())
        );

        process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);
}

export function createWorkerContainer() {
    const submissionRepo = new SqlSubmissionRepository();
    const problemRepo = new SqlProblemRepository();
    const testcaseRepo = new SqlTestCaseRepository();

    languagePools.init();
    registerShutdown(languagePools);

    const judge = new DockerJudge(languagePools);

    startStuckRecovery(submissionRepo);

    const submissionService = new SubmissionExecutionService(
        submissionRepo,
        problemRepo,
        testcaseRepo,
        judge
    );

    const INTERVAL_MS = 60000;

    setInterval(async () => {
        const stuck =
            await submissionRepo.findStuckRunning(INTERVAL_MS * 10);

        for (const sub of stuck) {
            await submissionRepo.update({
                ...sub,
                status: "PENDING",
                startedAt: new Date()
            });
        }
    }, INTERVAL_MS);

    return {
        submissionService,
        submissionRepo,
    };
}
