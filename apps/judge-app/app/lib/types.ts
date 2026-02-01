export type ServerError = {
    message: string,
};

export type Contest = {
    id: string;
    name: string;
    description: string;
    starts_at: string;
    ends_at: string;
    is_public: boolean;
    created_by: string;
    created_at?: string;
    updated_at?: string;
};

export type ContestProblem = {
    contest_id: string;
    problem_id: string;
    position: number;
    title?: string;
    difficulty?: string;
};

export type ContestParticipant = {
    contest_id: string;
    user_id: string;
    joined_at: string;
    rank?: number;
    solved?: number;
    penalty?: number;
};

export type ContestRegistration = {
    contest_id: string;
    user_id: string;
    registered_at: string;
    status: "registered" | "participated" | "dropped";
};

export type ContestStanding = {
    user_id: string;
    username: string;
    rank: number;
    solved: number;
    penalty: number;
    problems: Array<{
        problem_id: string;
        status: "AC" | "WA" | "TLE" | "CE" | "-";
        penalty_time: number;
        attempts: number;
    }>;
};

export type ContestStatus = "upcoming" | "ongoing" | "finished";
