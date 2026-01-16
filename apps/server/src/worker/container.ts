import { DockerJudge } from "../judge/docker/docker-judge";
import { SubmissionExecutionService } from "../services/submission.service";
import { SqlProblemRepository } from "../repositories/sql/problem.repository.sql";
import { SqlSubmissionRepository } from "../repositories/sql/submission.repository.sql";
import { SqlTestCaseRepository } from "../repositories/sql/testcase.repository.sql";
import { startStuckRecovery } from "./submission.recovery";

export function createWorkerContainer() {
    const submissionRepo = new SqlSubmissionRepository();
    const problemRepo = new SqlProblemRepository();
    const testcaseRepo = new SqlTestCaseRepository();
    const judge = new DockerJudge();

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
