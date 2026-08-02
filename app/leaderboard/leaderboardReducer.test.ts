import { describe, expect, it } from "vitest";

import type { LeaderboardState, User } from "./leaderboard.types";
import {
    initialLeaderboardState,
    leaderboardReducer,
} from "./leaderboardReducer";

const makeUser = (id: string, score: number): User => ({
    id,
    name: `User ${id}`,
    score,
});

const deepFreeze = (state: LeaderboardState): LeaderboardState => {
    Object.values(state.users).forEach((user) => Object.freeze(user));
    Object.freeze(state.users);
    return Object.freeze(state);
};

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

    it("still applies the snapshot to everyone else", () => {
        const seeded = leaderboardReducer(initialLeaderboardState, {
            type: "FETCH_SUCCESS",
            payload: [makeUser("42", 10), makeUser("7", 5)],
        });

        const afterLiveUpdate = leaderboardReducer(seeded, {
            type: "UPDATE_USER",
            payload: makeUser("42", 999),
        });

        const merged = leaderboardReducer(afterLiveUpdate, {
            type: "FETCH_SUCCESS",
            payload: [
                makeUser("42", 100),
                makeUser("7", 400),
                makeUser("9", 50),
            ],
        });

        expect(merged.users["42"]?.score).toBe(999);
        // Refusing every incoming row protects the local update and turns
        // polling into a no-op.
        expect(merged.users["7"]?.score).toBe(400);
        expect(merged.users["9"]?.score).toBe(50);
    });

    it("keeps the local update across the whole fetch cycle", () => {
        const afterLiveUpdate = leaderboardReducer(initialLeaderboardState, {
            type: "UPDATE_USER",
            payload: makeUser("42", 999),
        });

        const loading = leaderboardReducer(afterLiveUpdate, {
            type: "FETCH_START",
        });
        expect(loading.loading).toBe(true);
        expect(loading.users["42"]?.score).toBe(999);

        const settled = leaderboardReducer(loading, {
            type: "FETCH_SUCCESS",
            payload: [makeUser("42", 100)],
        });

        expect(settled.loading).toBe(false);
        expect(settled.users["42"]?.score).toBe(999);
    });

    it("does not mutate the state it is given", () => {
        const afterLiveUpdate = deepFreeze(
            leaderboardReducer(initialLeaderboardState, {
                type: "UPDATE_USER",
                payload: makeUser("42", 999),
            })
        );

        const merged = leaderboardReducer(afterLiveUpdate, {
            type: "FETCH_SUCCESS",
            payload: [makeUser("42", 100)],
        });

        expect(merged.users["42"]?.score).toBe(999);
        expect(afterLiveUpdate.users["42"]?.score).toBe(999);
        expect(merged).not.toBe(afterLiveUpdate);
    });

    it("adds a live update for a user it has never seen", () => {
        const state = leaderboardReducer(initialLeaderboardState, {
            type: "UPDATE_USER",
            payload: makeUser("77", 12),
        });

        expect(state.users["77"]).toEqual(makeUser("77", 12));
        expect(
            leaderboardReducer(state, { type: "FETCH_START" }).users["77"]
                ?.score
        ).toBe(12);
    });
});
