import { DockerWorker } from "./docker.worker";
import { WorkerPool } from "./pool.worker";

export class LanguagePools {
    private readonly pools = new Map<string, WorkerPool<DockerWorker>>();
    private initialized: boolean = false;

    async init(): Promise<void> {
        this.pools.set(
            "python",
            await this.createPool("judge-python", 1024, 4)
        );

        this.pools.set(
            "cpp",
            await this.createPool("judge-cpp", 1024, 4)
        );
        
        this.pools.set(
            "c",
            await this.createPool("judge-c", 1024, 4)
        );

        this.initialized = true;
    }

    private async createPool(
        image: string,
        memoryMb: number,
        size: number
    ): Promise<WorkerPool<DockerWorker>> {
        const workers: DockerWorker[] = [];

        for (let i = 0; i < size; i++) {
            const w = new DockerWorker(image, memoryMb, i);
            await w.init();
            await w.start();
            workers.push(w);
        }

        return new WorkerPool(workers);
    }

    get(language: string): WorkerPool<DockerWorker> {
        const pool = this.pools.get(language);
        if (!pool) {
            throw new Error(`Unsupported language: ${language}`);
        }
        return pool;
    }

    isInitialized() { return this.initialized; }

    getAllWorkers(): DockerWorker[] {
        return Array.from(this.pools.values())
            .flatMap(pool => pool.workers());
    }

}

export const languagePools = new LanguagePools();
