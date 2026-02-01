import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { Judge, JudgeRequest, JudgeResult } from "@judgeapp/shared/domain/judge";
import { LanguagePools } from "../../worker/submission/docker/pool.languages";
import { normalizePath } from "../../utils/path";
import { Language, LanguageConfig, LANGUAGES } from "@judgeapp/shared/domain/languages"

export class DockerJudge implements Judge {
    constructor(private readonly pools: LanguagePools) {}

    async run(req: JudgeRequest): Promise<JudgeResult> {
        const pool = this.pools.get(req.language);
        const worker = await pool.acquire();

        const stagingDir = normalizePath(await fs.mkdtemp(path.join(os.tmpdir(), "judge-")));

        try {
            await worker.reset();
            await this.prepareFiles(stagingDir, req);

            await worker.copyIn(path.join(stagingDir, "src"), "src");
            await worker.copyIn(path.join(stagingDir, "tests"), "tests");
            await worker.copyIn(path.join(stagingDir, "limits"), "limits");

            const outcome = await worker.run();

            if (outcome === "TLE") {
                await worker.reset();
                return this.makeSyntheticResult("TLE", req);
            }
            if (outcome === "OOM") {
                await worker.reset();
                return this.makeSyntheticResult("MLE", req);
            }

            const resultPath = normalizePath(path.join(worker.outDir, "result.json"));

            return JSON.parse(await fs.readFile(resultPath, "utf-8"));
        }
        finally {
            pool.release(worker);
            await fs.rm(stagingDir, { recursive: true, force: true });
        }
    }

    private async prepareFiles(dir: string, req: JudgeRequest): Promise<void> {
        await fs.mkdir(path.join(dir, "src"));
        await fs.mkdir(path.join(dir, "tests"));
        await fs.mkdir(path.join(dir, "limits"));

        const config: LanguageConfig = LANGUAGES[req.language as Language];
        await fs.writeFile(
            path.join(dir, "src", `Main.${config.extension}`),
            req.sourceCode,
            "utf-8"
        );

        await fs.writeFile(
            path.join(dir, "tests", "testcases.json"),
            JSON.stringify(req.testCases),
            "utf-8"
        );

        await fs.writeFile(
            path.join(dir, "limits", "limits.json"),
            JSON.stringify(req.limits),
            "utf-8"
        );
    }

    private makeSyntheticResult(
        status: JudgeResult["status"],
        req: JudgeRequest
    ): JudgeResult {
        return {
            status,
            timeMs: req.limits.timeMs,
            memoryKb: 0,
            passed: 0,
            total: req.testCases.length,
            case_results: []
        };
    }
}
