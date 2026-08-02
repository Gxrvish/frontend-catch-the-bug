// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MyListPanel } from "./MyListPanel";
import { seedTitles, useWatchlistStore } from "./watchlistStore";

describe("MyListPanel", () => {
    beforeEach(() => {
        useWatchlistStore.setState({ titles: seedTitles(), filter: "" });
    });

    it("does not re-render when only the grid filter changes", () => {
        const onRender = vi.fn();
        render(<MyListPanel onRender={onRender} />);

        const rendersAfterMount = onRender.mock.calls.length;

        // Typing in the filter box is unrelated to the saved list.
        act(() => {
            useWatchlistStore.getState().setFilter("midnight");
        });
        act(() => {
            useWatchlistStore.getState().setFilter("midnight pro");
        });

        expect(onRender.mock.calls.length).toBe(rendersAfterMount);
    });

    it("re-renders when the saved list actually changes", () => {
        const onRender = vi.fn();
        render(<MyListPanel onRender={onRender} />);
        const before = onRender.mock.calls.length;

        act(() => {
            useWatchlistStore.getState().addToList("t-3");
        });

        // Quiet for the filter is not the same as quiet for everything.
        expect(onRender.mock.calls.length).toBeGreaterThan(before);
        expect(screen.getByText("The Last Ledger")).toBeInTheDocument();

        act(() => {
            useWatchlistStore.getState().removeFromList("t-3");
        });

        expect(screen.queryByText("The Last Ledger")).not.toBeInTheDocument();
    });
});
