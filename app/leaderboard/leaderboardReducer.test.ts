import { describe, expect, it } from "vitest";

import type { User } from "./leaderboard.types";
import {
    initialLeaderboardState,
    leaderboardReducer,
} from "./leaderboardReducer";

const makeUser = (id: string, score: number): User => ({
    id,
    name: `User ${id}`,
    score,
});

describe("leaderboardReducer", () => {
    it("keeps newer local update when a stale fetch snapshot arrives", () => {
        const id = "42";

        const afterLiveUpdate = leaderboardReducer(initialLeaderboardState, {
            type: "UPDATE_USER",
            payload: makeUser(id, 999),
        });

        const afterFetchSnapshot = leaderboardReducer(afterLiveUpdate, {
            type: "FETCH_SUCCESS",
            payload: [makeUser(id, 100)],
        });

        // This should stay 999 once the race-condition fix is implemented.
        expect(afterFetchSnapshot.users[id]?.score).toBe(999);
    });
});
