// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetBadgeRenders, CartBadge, getBadgeRenders } from "./CartBadge";
import { CartStore } from "./CartStore";
import {
    _resetStore,
    addItem,
    getState,
    increment,
    listenerCount,
    setState,
} from "./store";

const click = (name: string) =>
    fireEvent.click(screen.getByRole("button", { name }));

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

    it("stays quiet through repeated no-op updates but still wakes for a real one", () => {
        render(<CartBadge />);

        const beforeNoops = getBadgeRenders();
        click("Add empty slot");
        click("Add empty slot");
        expect(getBadgeRenders() - beforeNoops).toBe(0);

        const beforeReal = getBadgeRenders();
        click("Add product");

        // Silencing the badge is the other way to make the line above
        // pass — it still has to react to its own slice.
        expect(getBadgeRenders() - beforeReal).toBeGreaterThanOrEqual(1);
        expect(screen.getByTestId("active-count")).toHaveTextContent("2");
    });

    it("does not re-render the badge for an unrelated slice", () => {
        render(<CartBadge />);
        const before = getBadgeRenders();

        act(() => increment());

        // A counter the badge never reads must not reach it.
        expect(getBadgeRenders() - before).toBe(0);
        expect(screen.getByTestId("active-count")).toHaveTextContent("1");
    });

    it("drops its store subscription when it unmounts", () => {
        const { unmount } = render(<CartBadge />);
        expect(listenerCount()).toBe(1);

        unmount();

        expect(listenerCount()).toBe(0);
    });

    it("holds one subscription across re-renders and none after unmount", () => {
        const { unmount } = render(<CartBadge />);

        click("Add product");
        click("Add product");

        // Re-subscribing per render is the other way to grow this list.
        expect(listenerCount()).toBe(1);

        unmount();
        expect(listenerCount()).toBe(0);
    });

    it("unsubscribes every widget on the page, not only the badge", () => {
        const { unmount } = render(<CartStore />);
        expect(listenerCount()).toBe(2);

        unmount();

        expect(listenerCount()).toBe(0);
    });

    it("merges partial updates instead of replacing the whole state", () => {
        increment();

        expect(getState().count).toBe(1);
        expect(getState().items).toHaveLength(2);
    });

    it("keeps the counter when the items slice is updated", () => {
        addItem("x", 1);

        // The merge has to hold in both directions, not just the one the
        // ticket happens to name.
        expect(getState().count).toBe(0);
        expect(getState().items).toHaveLength(3);
    });

    it("leaves the state alone for an empty partial", () => {
        increment();
        setState({});

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
