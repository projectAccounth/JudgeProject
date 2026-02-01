export type Contest = {
    id: string;
    name: string;
    description: string | null;
    starts_at: Date | string;
    ends_at: Date | string;
    is_public: boolean;
    created_by: string;
    created_at?: Date | string;
    updated_at?: Date | string;
};

export type ContestProblem = {
    contest_id: string;
    problem_id: string;
    position: number;
};

export type ContestParticipant = {
    contest_id: string;
    user_id: string;
    joined_at: Date | string;
};

export type ContestRegistration = {
    contest_id: string;
    user_id: string;
    registered_at: Date | string;
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

export const getContestStatus = (contest: Contest): ContestStatus => {
    const now = new Date();
    const starts = new Date(contest.starts_at);
    const ends = new Date(contest.ends_at);

    if (now < starts) return "upcoming";
    if (now > ends) return "finished";
    return "ongoing";
};
