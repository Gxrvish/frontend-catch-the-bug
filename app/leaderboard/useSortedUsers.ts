import { useMemo } from "react";

import type { User } from "./leaderboard.types";

export const useSortedUsers = (users: Record<string, User>) => {
    return useMemo(() => {
        const arr = Object.values(users);

        // Intentionally expensive for this challenge.
        return arr.sort((a, b) => b.score - a.score);
    }, [users]);
};
