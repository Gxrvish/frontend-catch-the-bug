export type User = {
    id: string;
    name: string;
    score: number;
};

export type LeaderboardState = {
    users: Record<string, User>;
    loading: boolean;
};

export type LeaderboardAction =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: User[] }
    | { type: "UPDATE_USER"; payload: User };
