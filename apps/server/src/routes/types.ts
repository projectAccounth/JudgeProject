import { User } from "../domain/user";

export interface AppRoute<TBody = unknown, TParams = unknown> {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    schema?: {
        body?: unknown;
        params?: unknown;
    };
    auth?: "OPTIONAL" | "REQUIRED";
    handler: (ctx: {
        body: TBody;
        params: TParams;
        user?: User;
        sessionId?: string;
    }) => Promise<unknown>;
}
