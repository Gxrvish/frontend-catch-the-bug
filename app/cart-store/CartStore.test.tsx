// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetBadgeRenders, CartBadge, getBadgeRenders } from "./CartBadge";
import { _resetStore, getState, increment, listenerCount } from "./store";

describe("CartStore", () => {
    beforeEach(() => {
        _resetStore();
        _resetBadgeRenders();
    });

    it("does not re-render the badge when the active count is unchanged", () => {
        render(<CartBadge />);

        const before = getBadgeRenders();
        // Adds an out-of-stock slot: the active-item count doesn't move.
        fireEvent.click(screen.getByRole("button", { name: "Add empty slot" }));

        expect(getBadgeRenders() - before).toBe(0);
    });

    it("drops its store subscription when it unmounts", () => {
        const { unmount } = render(<CartBadge />);
        expect(listenerCount()).toBe(1);

        unmount();

        expect(listenerCount()).toBe(0);
    });

    it("merges partial updates instead of replacing the whole state", () => {
        increment();

        expect(getState().count).toBe(1);
        expect(getState().items).toHaveLength(2);
    });

    it("re-renders the badge when the active count actually changes", () => {
        render(<CartBadge />);
        expect(screen.getByTestId("active-count")).toHaveTextContent("1");

        fireEvent.click(screen.getByRole("button", { name: "Add product" }));

        expect(screen.getByTestId("active-count")).toHaveTextContent("2");
    });
});
