// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AnalyticsTiles } from "./AnalyticsTiles";
import type { StatOptions } from "./analyticsTiles.types";
import { TRAFFIC_LEGEND } from "./tileData";
import { _resetTileProbes, tileProbes } from "./tileProbes";
import { ActionTile, Legend, StatTile, TileFrame } from "./tiles";

const OPTIONS: StatOptions = { currency: "EUR", compact: true };

const refresh = () =>
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

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

    it("keeps stat tiles memoized without freezing them", () => {
        const dashboard = render(<AnalyticsTiles />);
        const settled = tileProbes.stat;
        refresh();
        expect(tileProbes.stat).toBe(settled);
        dashboard.unmount();

        // An always-equal comparator would satisfy the line above and
        // leave the tile stuck on its first value forever.
        const tile = render(
            <StatTile label="Revenue" value={1000} options={OPTIONS} />
        );
        const mounted = tileProbes.stat;
        tile.rerender(
            <StatTile label="Revenue" value={1000} options={OPTIONS} />
        );
        expect(tileProbes.stat).toBe(mounted);

        tile.rerender(
            <StatTile label="Revenue" value={2000} options={OPTIONS} />
        );
        expect(tileProbes.stat).toBe(mounted + 1);
        expect(screen.getByText("€2.0k")).toBeInTheDocument();
    });

    it("keeps action tiles memoized without freezing them", () => {
        const dashboard = render(<AnalyticsTiles />);
        const settled = tileProbes.action;
        refresh();
        expect(tileProbes.action).toBe(settled);
        dashboard.unmount();

        const onSelect = () => {};
        const tile = render(
            <ActionTile
                id="sessions"
                label="Sessions"
                value="18.4k"
                onSelect={onSelect}
            />
        );
        const mounted = tileProbes.action;
        tile.rerender(
            <ActionTile
                id="sessions"
                label="Sessions"
                value="18.4k"
                onSelect={onSelect}
            />
        );
        expect(tileProbes.action).toBe(mounted);

        tile.rerender(
            <ActionTile
                id="sessions"
                label="Sessions"
                value="19.1k"
                onSelect={onSelect}
            />
        );
        expect(tileProbes.action).toBe(mounted + 1);
        expect(screen.getByText("19.1k")).toBeInTheDocument();
    });

    it("keeps framed tiles memoized without freezing them", () => {
        const dashboard = render(<AnalyticsTiles />);
        const settled = tileProbes.frame;
        refresh();
        expect(tileProbes.frame).toBe(settled);
        dashboard.unmount();

        const legend = <Legend items={TRAFFIC_LEGEND} />;
        const frame = render(
            <TileFrame title="Traffic sources">{legend}</TileFrame>
        );
        const mounted = tileProbes.frame;
        frame.rerender(<TileFrame title="Traffic sources">{legend}</TileFrame>);
        expect(tileProbes.frame).toBe(mounted);

        // Different children are different props — the frame still has to
        // paint them.
        frame.rerender(
            <TileFrame title="Traffic sources">
                <p>No data</p>
            </TileFrame>
        );
        expect(tileProbes.frame).toBe(mounted + 1);
        expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("does not re-render the other tiles when a tile is selected", () => {
        render(<AnalyticsTiles />);
        const before = { ...tileProbes };

        fireEvent.click(screen.getByRole("button", { name: /Sessions/ }));

        // Selecting is a parent state change like Refresh is — the same
        // prop identities have to survive it.
        expect(screen.getByTestId("selected-tile")).toHaveTextContent(
            "sessions"
        );
        expect(tileProbes.stat).toBe(before.stat);
        expect(tileProbes.action).toBe(before.action);
        expect(tileProbes.frame).toBe(before.frame);

        // Each tile still reports its own id, not a captured neighbour's.
        fireEvent.click(screen.getByRole("button", { name: /Sign-ups/ }));
        expect(screen.getByTestId("selected-tile")).toHaveTextContent(
            "signups"
        );
        expect(tileProbes.stat).toBe(before.stat);
        expect(tileProbes.frame).toBe(before.frame);
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
