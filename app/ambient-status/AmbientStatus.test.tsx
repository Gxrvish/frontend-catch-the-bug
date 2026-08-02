// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AmbientStatus } from "./AmbientStatus";

type ChangeHandler = (event: { matches: boolean }) => void;

class FakeMediaQueryList {
    static instances: FakeMediaQueryList[] = [];
    // What the OS reports to every list created from now on.
    static initialMatches = false;

    matches = false;
    query: string;
    private handlers = new Set<ChangeHandler>();

    constructor(query: string) {
        this.query = query;
        this.matches = FakeMediaQueryList.initialMatches;
        FakeMediaQueryList.instances.push(this);
    }

    get handlerCount() {
        return this.handlers.size;
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

const liveHandlers = () =>
    FakeMediaQueryList.instances.reduce(
        (total, mql) => total + mql.handlerCount,
        0
    );

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
        FakeMediaQueryList.initialMatches = false;
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
        cleanup();
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("follows the OS theme when it changes", () => {
        render(<AmbientStatus />);
        expect(screen.getByTestId("theme")).toHaveTextContent("light");

        const mql = FakeMediaQueryList.instances[0];
        act(() => mql.flip(true));

        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });

    it("renders the scheme it started in and follows every later flip", () => {
        // The tab opens while the OS is already dark.
        FakeMediaQueryList.initialMatches = true;
        render(<AmbientStatus />);

        // Listening for changes is not enough — the first paint has to be
        // right too, before any event has fired.
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");

        const mql = FakeMediaQueryList.instances[0];
        expect(mql.query).toBe("(prefers-color-scheme: dark)");

        act(() => vi.advanceTimersByTime(2000));
        act(() => mql.flip(false));
        expect(screen.getByTestId("theme")).toHaveTextContent("light");

        // Back again — a one-shot subscription is not a subscription.
        act(() => mql.flip(true));
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");

        // The theme and the clock are separate concerns.
        expect(activeSeconds()).toBe(2);
    });

    it("subscribes to the color-scheme query once and unsubscribes on unmount", () => {
        render(<AmbientStatus />);

        // Re-render a few times — the subscription must not accumulate.
        act(() => vi.advanceTimersByTime(3000));

        expect(liveHandlers()).toBe(1);

        cleanup();

        // A live MediaQueryList handler keeps the unmounted tree reachable.
        expect(liveHandlers()).toBe(0);
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

    it("does not count a tab that was already hidden at mount", () => {
        visibility = "hidden";
        render(<AmbientStatus />);

        act(() => vi.advanceTimersByTime(5000));

        // Nobody has looked at this tab yet.
        expect(activeSeconds()).toBe(0);

        act(() => setVisibility("visible"));
        act(() => vi.advanceTimersByTime(2000));
        expect(activeSeconds()).toBe(2);
    });

    it("stops the timer while hidden rather than ignoring its ticks", () => {
        render(<AmbientStatus />);
        act(() => vi.advanceTimersByTime(1000));

        const whileVisible = vi.getTimerCount();

        act(() => setVisibility("hidden"));

        // A background tab should hold no wake-up of its own — swallowing
        // the increment still pays for the timer.
        expect(vi.getTimerCount()).toBeLessThan(whileVisible);

        act(() => setVisibility("visible"));
        expect(vi.getTimerCount()).toBe(whileVisible);
    });

    it("subscribes to visibilitychange once and unsubscribes on unmount", () => {
        const add = vi.spyOn(document, "addEventListener");
        const remove = vi.spyOn(document, "removeEventListener");
        const count = (spy: typeof add) =>
            spy.mock.calls.filter((call) => call[0] === "visibilitychange")
                .length;

        render(<AmbientStatus />);
        act(() => vi.advanceTimersByTime(3000));

        expect(count(add)).toBe(1);

        cleanup();

        expect(count(remove)).toBe(1);
    });

    it("counts focus time while the tab is visible", () => {
        render(<AmbientStatus />);

        act(() => vi.advanceTimersByTime(4000));

        expect(activeSeconds()).toBe(4);
    });
});
