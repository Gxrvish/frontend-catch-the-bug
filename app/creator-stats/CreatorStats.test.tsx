// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CreatorStats } from "./CreatorStats";
import { CHANNEL } from "./statsApi";

// The panel is meant to pay for itself: nothing should hit the analytics
// endpoint until someone opens it.
const { calls } = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock("./statsApi", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./statsApi")>();
    return {
        ...actual,
        fetchAdvancedStats: (channelId: string) => {
            calls.push(channelId);
            return actual.fetchAdvancedStats(channelId);
        },
    };
});

const toggle = () =>
    fireEvent.click(
        screen.getByRole("button", { name: /advanced analytics/i })
    );

describe("CreatorStats", () => {
    beforeEach(() => {
        calls.length = 0;
        // React reports render errors loudly; keep the test output readable.
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("opens the advanced analytics panel without crashing", async () => {
        render(<CreatorStats />);

        fireEvent.click(
            screen.getByRole("button", { name: /show advanced analytics/i })
        );

        expect(await screen.findByText(/watch time/i)).toBeInTheDocument();
        expect(screen.getByText(/avg view duration/i)).toBeInTheDocument();
    });

    it("does not touch the analytics endpoint until the panel is opened", async () => {
        render(<CreatorStats />);

        // Calling the hook unconditionally is the easy way out — and it
        // buys the request back on every mount.
        expect(calls).toEqual([]);

        toggle();
        expect(await screen.findByText(/watch time/i)).toBeInTheDocument();

        expect(calls).toEqual([CHANNEL.id]);
    });

    it("shows the loading state and then every metric", async () => {
        render(<CreatorStats />);

        toggle();
        expect(screen.getByText(/crunching numbers/i)).toBeInTheDocument();

        expect(await screen.findByText(/watch time/i)).toBeInTheDocument();
        expect(screen.getByText(/182,400\s*h/)).toBeInTheDocument();
        expect(screen.getByText("254s")).toBeInTheDocument();
        expect(screen.getByText("$4.2")).toBeInTheDocument();
        expect(
            screen.getByText("I built a synth from scrap parts")
        ).toBeInTheDocument();
    });

    it("hides the metrics when the panel closes and brings them back", async () => {
        render(<CreatorStats />);

        toggle();
        expect(await screen.findByText(/watch time/i)).toBeInTheDocument();

        toggle();
        expect(screen.queryByText(/watch time/i)).not.toBeInTheDocument();
        expect(screen.getByText("Synthwave Garage")).toBeInTheDocument();

        toggle();
        expect(await screen.findByText(/watch time/i)).toBeInTheDocument();
    });

    it("shows the channel's baseline stats while the panel is closed", () => {
        render(<CreatorStats />);

        expect(screen.getByText("Synthwave Garage")).toBeInTheDocument();
        expect(screen.getByText(/128,400\s+subscribers/)).toBeInTheDocument();
        expect(screen.queryByText(/watch time/i)).not.toBeInTheDocument();
    });
});
