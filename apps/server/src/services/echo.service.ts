import { EchoRepository } from "../repositories/echo.repository";

export class EchoService {
    constructor(private readonly repo: EchoRepository) {}

    async echoMessage(message: string) {
        const record = {
            message,
            createdAt: Date.now(),
        };

        await this.repo.save(record);

        return record;
    }

    async listMessages() {
        return this.repo.list();
    }
}
