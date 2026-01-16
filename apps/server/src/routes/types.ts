export interface AppRoute<TBody = unknown, TParams = unknown> {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    schema?: {
        body?: unknown;
        params?: unknown;
    };
    handler: (ctx: {
        body: TBody;
        params: TParams;
        user?: { id: string };
    }) => Promise<unknown>;
}
