// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AmbientStatus } from "./AmbientStatus";

type ChangeHandler = (event: { matches: boolean }) => void;

class FakeMediaQueryList {
    static instances: FakeMediaQueryList[] = [];

    matches = false;
    query: string;
    private handlers = new Set<ChangeHandler>();

    constructor(query: string) {
        this.query = query;
        FakeMediaQueryList.instances.push(this);
    }

    addEventListener(_type: "change", handler: ChangeHandler) {
        this.handlers.add(handler);
    }

    removeEventListener(_type: "change", handler: ChangeHandler) {
        this.handlers.delete(handler);
    }

    // test driver: the OS theme flips
    flip(matches: boolean) {
        this.matches = matches;
        this.handlers.forEach((handler) => handler({ matches }));
    }
}

let visibility: DocumentVisibilityState = "visible";

const setVisibility = (state: DocumentVisibilityState) => {
    visibility = state;
    document.dispatchEvent(new Event("visibilitychange"));
};

const activeSeconds = () =>
    Number(screen.getByTestId("active").textContent ?? "-1");

describe("AmbientStatus", () => {
    beforeEach(() => {
        FakeMediaQueryList.instances = [];
        vi.stubGlobal(
            "matchMedia",
            (query: string) => new FakeMediaQueryList(query)
        );
        visibility = "visible";
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get: () => visibility,
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("follows the OS theme when it changes", () => {
        render(<AmbientStatus />);
        expect(screen.getByTestId("theme")).toHaveTextContent("light");

        const mql = FakeMediaQueryList.instances[0];
        act(() => mql.flip(true));

        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });

    it("pauses the focus clock while the tab is hidden", () => {
        render(<AmbientStatus />);

        act(() => vi.advanceTimersByTime(3000));
        expect(activeSeconds()).toBe(3);

        act(() => setVisibility("hidden"));
        act(() => vi.advanceTimersByTime(5000));

        expect(activeSeconds()).toBe(3);

        // Coming back resumes the clock.
        act(() => setVisibility("visible"));
        act(() => vi.advanceTimersByTime(2000));
        expect(activeSeconds()).toBe(5);
    });

    it("counts focus time while the tab is visible", () => {
        render(<AmbientStatus />);

        act(() => vi.advanceTimersByTime(4000));

        expect(activeSeconds()).toBe(4);
    });
});
