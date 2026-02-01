import { languagePools } from "../worker/submission/docker/pool.languages";

export class HealthService {
    async getHealth() {
        if (!languagePools.isInitialized()) {
            return { status: "NOT_INITIALIZED" };
        }

        return {
            status: "OK",
            pools: Array.from(languagePools["pools"].entries()).map(
                ([lang, pool]) => ({
                    language: lang,
                    stats: pool.getStats(),
                    workers: pool.workers().map((w: any) => w.getHealth()),
                }),
            ),
        };
    }
}

