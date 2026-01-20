import { DockerJudge } from "../../judge/docker/docker-judge";
import { SubmissionExecutionService } from "../../services/submission.service";
import { SqlProblemRepository } from "../../repositories/sql/problem.repository.sql";
import { SqlSubmissionRepository } from "../../repositories/sql/submission.repository.sql";
import { SqlTestCaseRepository } from "../../repositories/sql/testcase.repository.sql";
import { LanguagePools, languagePools } from "./docker/pool.languages";
import { SubmissionScheduler } from "../../repositories/in-memory/submission.scheduler.memory";
import { ProblemAuthoringService } from "../../services/problem-author.service";

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

export function createWorkerContainer(submissionRepo: SqlSubmissionRepository) {
    const problemRepo = new SqlProblemRepository();
    const testcaseRepo = new SqlTestCaseRepository();

    languagePools.init();
    registerShutdown(languagePools);

    const judge = new DockerJudge(languagePools);

    const submissionService = new SubmissionExecutionService(
        submissionRepo,
        problemRepo,
        testcaseRepo,
        judge
    );

    const authoringService = new ProblemAuthoringService(
        problemRepo,
        testcaseRepo
    );

    const scheduler: SubmissionScheduler = 
        new SubmissionScheduler(submissionRepo, submissionService, 8);

    return {
        scheduler,
        authoringService
    };
}
