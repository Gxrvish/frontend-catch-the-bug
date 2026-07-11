// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AnalyticsTiles } from "./AnalyticsTiles";
import { _resetTileProbes, tileProbes } from "./tileProbes";

describe("AnalyticsTiles", () => {
    beforeEach(() => {
        _resetTileProbes();
    });

    it("does not re-render stat tiles on refresh", () => {
        render(<AnalyticsTiles />);

        const before = tileProbes.stat;
        fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

        expect(tileProbes.stat).toBe(before);
    });

    it("does not re-render action tiles on refresh", () => {
        render(<AnalyticsTiles />);

        const before = tileProbes.action;
        fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

        expect(tileProbes.action).toBe(before);
    });

    it("does not re-render framed tiles on refresh", () => {
        render(<AnalyticsTiles />);

        const before = tileProbes.frame;
        fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

        expect(tileProbes.frame).toBe(before);
    });

    it("renders all tiles and selecting one still works", () => {
        render(<AnalyticsTiles />);

        expect(screen.getByText("€1.2M")).toBeInTheDocument();
        expect(screen.getByText("€5.2k")).toBeInTheDocument();
        expect(screen.getByText("Organic")).toBeInTheDocument();
        expect(screen.getByText("Mobile")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /Sessions/ }));
        expect(screen.getByTestId("selected-tile")).toHaveTextContent(
            "sessions"
        );
    });
});
