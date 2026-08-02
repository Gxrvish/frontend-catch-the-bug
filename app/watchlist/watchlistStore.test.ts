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

    it("adds a title as a new snapshot, touching nothing else", () => {
        const before = useWatchlistStore.getState().titles;

        useWatchlistStore.getState().addToList("t-3");
        const after = useWatchlistStore.getState().titles;

        // A new array — that is how a subscriber sees a change at all.
        expect(after).not.toBe(before);
        expect(before.find((t) => t.id === "t-3")?.saved).toBe(false);
        expect(after.find((t) => t.id === "t-3")?.saved).toBe(true);
        // Its neighbours are exactly as they were.
        expect(after.find((t) => t.id === "t-5")?.saved).toBe(false);
        expect(after.find((t) => t.id === "t-1")?.saved).toBe(true);
    });

    it("round-trips a title in and out of the list", () => {
        useWatchlistStore.getState().addToList("t-4");
        expect(
            useWatchlistStore.getState().titles.find((t) => t.id === "t-4")
                ?.saved
        ).toBe(true);

        useWatchlistStore.getState().removeFromList("t-4");
        expect(
            useWatchlistStore.getState().titles.find((t) => t.id === "t-4")
                ?.saved
        ).toBe(false);
    });
});
