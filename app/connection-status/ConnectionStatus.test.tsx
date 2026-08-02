// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConnectionStatus } from "./ConnectionStatus";
import { connectionStore } from "./connectionStore";

const pill = () => screen.getByTestId("status-pill");

describe("ConnectionStatus", () => {
    beforeEach(() => {
        connectionStore._reset();
        // React reports the (expected) update-depth error loudly; keep the
        // test output readable.
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the status pill without spiralling into re-renders", () => {
        expect(() => render(<ConnectionStatus />)).not.toThrow();
        expect(screen.getByTestId("status-pill")).toHaveTextContent("Online");
    });

    it("hands out the same snapshot until the state actually changes", () => {
        const first = connectionStore.getSnapshot();

        // This is the whole contract: unchanged store, identical value.
        expect(connectionStore.getSnapshot()).toBe(first);

        connectionStore.setOnline(false);
        const second = connectionStore.getSnapshot();

        // …and a caching fix that never invalidates is the other failure.
        expect(second).not.toBe(first);
        expect(second.online).toBe(false);
        expect(connectionStore.getSnapshot()).toBe(second);

        expect(connectionStore.getServerSnapshot()).toBe(
            connectionStore.getServerSnapshot()
        );
    });

    it("follows the connection going down and coming back", () => {
        render(<ConnectionStatus />);
        expect(pill()).toHaveTextContent("Online");

        fireEvent.click(screen.getByRole("button", { name: "Go offline" }));
        expect(pill()).toHaveTextContent("Offline");

        fireEvent.click(screen.getByRole("button", { name: "Go online" }));
        expect(pill()).toHaveTextContent("Online");
    });

    it("does not record a check just for mounting", () => {
        render(<ConnectionStatus />);

        // Writing to the store to stabilise identity would show up here.
        expect(screen.getByText(/0 checks recorded/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Ping" }));
        expect(screen.getByText(/1 checks recorded/)).toBeInTheDocument();
    });

    it("store notifies subscribers and tracks state transitions", () => {
        const seen: boolean[] = [];
        const unsubscribe = connectionStore.subscribe(() => {
            seen.push(connectionStore.getSnapshot().online);
        });

        connectionStore.setOnline(false);
        connectionStore.setOnline(true);
        expect(seen).toEqual([false, true]);
        expect(connectionStore.getSnapshot().checks).toBe(2);

        unsubscribe();
        connectionStore.setOnline(false);
        expect(seen).toEqual([false, true]);
    });
});
