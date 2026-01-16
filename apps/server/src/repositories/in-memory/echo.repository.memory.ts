import { EchoRecord, EchoRepository } from "../echo.repository";

export class InMemoryEchoRepository implements EchoRepository {
    private readonly records: EchoRecord[] = [];

    async save(record: EchoRecord): Promise<void> {
        this.records.push(record);
    }

    async list(): Promise<EchoRecord[]> {
        return [...this.records];
    }
}
