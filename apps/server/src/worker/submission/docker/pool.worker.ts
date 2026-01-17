export class WorkerPool<T> {
    private readonly idle: T[] = [];
    private readonly busy = new Set<T>();
    private readonly waiters: ((w: T) => void)[] = [];

    constructor(workers: T[]) {
        this.idle = workers;
    }

    workers(): T[] {
        return [...this.idle, ...Array.from(this.busy)];
    }

    async acquire(): Promise<T> {
        const w = this.idle.pop();
        if (w) {
            this.busy.add(w);
            return w;
        }
        return new Promise(res => this.waiters.push(res));
    }

    release(w: T): void {
        this.busy.delete(w);
        const next = this.waiters.shift();
        if (next) {
            next(w);
        } else {
            this.idle.push(w);
        }
    }
}
