import { EchoService } from "../services/echo.service";

export class EchoController {
    constructor(private readonly service: EchoService) {}

    async create(body: { message: string }) {
        return this.service.echoMessage(body.message);
    }

    async list() {
        return this.service.listMessages();
    }
}