// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreatorStats } from "./CreatorStats";

describe("CreatorStats", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("opens the advanced analytics panel without crashing", async () => {
        // React reports render errors loudly; keep the test output readable.
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(<CreatorStats />);

        fireEvent.click(
            screen.getByRole("button", { name: /show advanced analytics/i })
        );

        expect(await screen.findByText(/watch time/i)).toBeInTheDocument();
        expect(screen.getByText(/avg view duration/i)).toBeInTheDocument();
    });

    it("shows the channel's baseline stats while the panel is closed", () => {
        render(<CreatorStats />);

        expect(screen.getByText("Synthwave Garage")).toBeInTheDocument();
        expect(screen.getByText(/128,400\s+subscribers/)).toBeInTheDocument();
        expect(screen.queryByText(/watch time/i)).not.toBeInTheDocument();
    });
});
