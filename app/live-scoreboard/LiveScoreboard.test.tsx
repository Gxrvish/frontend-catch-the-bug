// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveScoreboard } from "./LiveScoreboard";
import type { ScoreEvent } from "./liveScoreboard.types";

// The real scripted feed still runs; the mock only keeps a handle on the
// consumer's handler so a test can replay its own delivery order.
const { captured } = vi.hoisted(() => ({
    captured: [] as Array<(event: ScoreEvent) => void>,
}));

vi.mock("./scoreSocket", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./scoreSocket")>();
    return {
        ...actual,
        connectScoreFeed: (onEvent: (event: ScoreEvent) => void) => {
            captured.push(onEvent);
            return actual.connectScoreFeed(onEvent);
        },
    };
});

const deliver = (...events: ScoreEvent[]) =>
    act(() => {
        events.forEach((event) => captured[0]?.(event));
    });

const scoreline = () => screen.getByTestId("scoreline");
const note = () => screen.getByTestId("last-note");

describe("LiveScoreboard", () => {
    beforeEach(() => {
        captured.length = 0;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("settles on the newest score even when events arrive out of order", async () => {
        render(<LiveScoreboard />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 150));
        });

        expect(screen.getByTestId("scoreline")).toHaveTextContent(
            "Rovers 2 – 1 United"
        );
    });

    it("keeps the note from the newest event, not the last delivered", async () => {
        render(<LiveScoreboard />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 150));
        });

        // seq 3 is the newest; the stale seq 2 that landed after it must
        // not leave its caption on screen either.
        expect(note()).toHaveTextContent("Rovers score");
    });

    it("ignores an older event whatever order it arrives in", async () => {
        vi.useFakeTimers();
        render(<LiveScoreboard />);

        // Newest first this time, then the two it supersedes.
        await deliver(
            { seq: 3, home: 2, away: 1, note: "Rovers score" },
            { seq: 1, home: 1, away: 0, note: "Rovers score" },
            { seq: 2, home: 1, away: 1, note: "United equalise" }
        );

        expect(scoreline()).toHaveTextContent("Rovers 2 – 1 United");

        // A repeat of one already applied changes nothing.
        await deliver({ seq: 3, home: 2, away: 1, note: "Rovers score" });
        expect(scoreline()).toHaveTextContent("Rovers 2 – 1 United");
    });

    it("applies a correction that lowers the score", async () => {
        vi.useFakeTimers();
        render(<LiveScoreboard />);

        await deliver(
            { seq: 1, home: 1, away: 0, note: "Rovers score" },
            { seq: 3, home: 2, away: 1, note: "Rovers score" },
            { seq: 2, home: 0, away: 0, note: "VAR: goal disallowed" }
        );
        expect(scoreline()).toHaveTextContent("Rovers 2 – 1 United");

        // Keeping the highest numbers seen is not ordering — a newer
        // event may take a goal away.
        await deliver({
            seq: 4,
            home: 2,
            away: 0,
            note: "VAR: United goal disallowed",
        });
        expect(scoreline()).toHaveTextContent("Rovers 2 – 0 United");
        expect(note()).toHaveTextContent("VAR: United goal disallowed");
    });

    it("stops listening when the board unmounts", async () => {
        vi.useFakeTimers();
        const { unmount } = render(<LiveScoreboard />);
        await deliver({ seq: 1, home: 1, away: 0, note: "Rovers score" });
        expect(scoreline()).toHaveTextContent("Rovers 1 – 0 United");

        unmount();

        // The scripted events are still pending; none of them may reach a
        // tree React has already discarded.
        expect(() => vi.advanceTimersByTime(200)).not.toThrow();
    });

    it("shows the kick-off state before any event arrives", () => {
        render(<LiveScoreboard />);

        expect(screen.getByTestId("scoreline")).toHaveTextContent(
            "Rovers 0 – 0 United"
        );
        expect(screen.getByTestId("last-note")).toHaveTextContent("Kick-off");
    });
});
