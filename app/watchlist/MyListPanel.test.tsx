// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
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
});
