// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponsiveGrid } from "./ResponsiveGrid";

type ROEntry = { target: Element; contentRect: { width: number } };
type ROCallback = (entries: ROEntry[]) => void;

class FakeResizeObserver {
    static instances: FakeResizeObserver[] = [];

    callback: ROCallback;
    targets: Element[] = [];
    disconnected = false;

    constructor(callback: ROCallback) {
        this.callback = callback;
        FakeResizeObserver.instances.push(this);
    }

    observe(el: Element) {
        this.targets.push(el);
    }

    unobserve() {}

    disconnect() {
        this.disconnected = true;
    }

    // test driver
    trigger(width: number) {
        this.callback(
            this.targets.map((target) => ({
                target,
                contentRect: { width },
            }))
        );
    }
}

describe("ResponsiveGrid", () => {
    beforeEach(() => {
        FakeResizeObserver.instances = [];
        vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("disconnects the observer on unmount", () => {
        const { unmount } = render(<ResponsiveGrid />);
        const observer = FakeResizeObserver.instances[0];

        unmount();

        expect(observer.disconnected).toBe(true);
    });

    it("adapts the column count to the measured content width", () => {
        render(<ResponsiveGrid />);
        const observer = FakeResizeObserver.instances[0];

        act(() => observer.trigger(1000));

        expect(screen.getByTestId("columns")).toHaveTextContent("3");
        expect(screen.getByTestId("width")).toHaveTextContent("1000");
    });

    it("renders all six grid cells", () => {
        render(<ResponsiveGrid />);

        expect(screen.getAllByTestId("cell")).toHaveLength(6);
    });
});
