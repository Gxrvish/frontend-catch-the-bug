import type { User } from "./leaderboard.types";

export const mockFetchUsers = async (): Promise<User[]> => {
    await new Promise((r) => setTimeout(r, Math.random() * 500 + 200));

    return Array.from({ length: 1000 }).map((_, i) => ({
        id: String(i),
        name: `User ${i}`,
        score: Math.floor(Math.random() * 1000),
    }));
};

export const mockUpdateUser = async (id: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, Math.random() * 300));

    return {
        id,
        name: `User ${id}`,
        score: Math.floor(Math.random() * 1000),
    };
};
