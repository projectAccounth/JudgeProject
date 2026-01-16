export type EchoRecord = {
    message: string;
    createdAt: number;
};

export interface EchoRepository {
    save(record: EchoRecord): Promise<void>;
    list(): Promise<EchoRecord[]>;
}
