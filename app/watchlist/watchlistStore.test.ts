import { beforeEach, describe, expect, it, vi } from "vitest";

import { seedTitles, useWatchlistStore } from "./watchlistStore";

describe("watchlistStore", () => {
    beforeEach(() => {
        useWatchlistStore.setState({ titles: seedTitles(), filter: "" });
    });

    it("notifies subscribers when a title is added to My List", () => {
        const listener = vi.fn();
        const unsubscribe = useWatchlistStore.subscribe(listener);

        useWatchlistStore.getState().addToList("t-3");

        expect(listener).toHaveBeenCalled();
        unsubscribe();
    });

    it("does not mutate the previous titles snapshot when adding", () => {
        const snapshotBefore = useWatchlistStore.getState().titles;
        const savedBefore = snapshotBefore.map((t) => t.saved);

        useWatchlistStore.getState().addToList("t-5");

        // External-store contract: old snapshots must stay frozen in time so
        // React can compare them against new ones.
        expect(snapshotBefore.map((t) => t.saved)).toEqual(savedBefore);

        // And the CURRENT state must reflect the add.
        const current = useWatchlistStore.getState().titles;
        expect(current.find((t) => t.id === "t-5")?.saved).toBe(true);
    });
});
