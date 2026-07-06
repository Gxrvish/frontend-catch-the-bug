// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConnectionStatus } from "./ConnectionStatus";
import { connectionStore } from "./connectionStore";

describe("ConnectionStatus", () => {
    beforeEach(() => {
        connectionStore._reset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the status pill without spiralling into re-renders", () => {
        // React reports the (expected) update-depth error loudly; keep the
        // test output readable.
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<ConnectionStatus />)).not.toThrow();
        expect(screen.getByTestId("status-pill")).toHaveTextContent("Online");
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
