// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _resetFrames, getFrames, LiveTicker } from "./LiveTicker";

class FakeRaf {
    static callbacks = new Map<number, FrameRequestCallback>();
    static nextId = 1;
    static now = 5000;

    static request(cb: FrameRequestCallback): number {
        const id = FakeRaf.nextId++;
        FakeRaf.callbacks.set(id, cb);
        return id;
    }

    static cancel(id: number) {
        FakeRaf.callbacks.delete(id);
    }

    static flush(steps: number, dtMs: number) {
        for (let i = 0; i < steps; i++) {
            FakeRaf.now += dtMs;
            const pending = [...FakeRaf.callbacks.entries()];
            FakeRaf.callbacks.clear();
            pending.forEach(([, cb]) => cb(FakeRaf.now));
        }
    }

    static reset() {
        FakeRaf.callbacks.clear();
        FakeRaf.nextId = 1;
        FakeRaf.now = 5000;
    }
}

const readValue = () =>
    parseFloat(screen.getByTestId("value").textContent ?? "0");

describe("LiveTicker", () => {
    beforeEach(() => {
        _resetFrames();
        FakeRaf.reset();
        vi.stubGlobal("requestAnimationFrame", FakeRaf.request);
        vi.stubGlobal("cancelAnimationFrame", FakeRaf.cancel);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("stops the loop when it unmounts", () => {
        const { unmount } = render(<LiveTicker />);
        act(() => FakeRaf.flush(2, 16));

        unmount();
        _resetFrames();
        act(() => FakeRaf.flush(2, 16));

        expect(getFrames()).toBe(0);
    });

    it("does not jump on the first frame", () => {
        render(<LiveTicker />);

        act(() => FakeRaf.flush(1, 16));

        // The first frame must seed the clock, not treat the whole
        // timestamp as elapsed time.
        expect(readValue()).toBeLessThan(1);
    });

    it("advances steadily while running", () => {
        render(<LiveTicker />);
        act(() => FakeRaf.flush(1, 100)); // warm up

        act(() => FakeRaf.flush(1, 100));
        const v1 = readValue();
        act(() => FakeRaf.flush(2, 100));
        const v2 = readValue();

        expect(v2).toBeGreaterThan(v1);
    });
});
