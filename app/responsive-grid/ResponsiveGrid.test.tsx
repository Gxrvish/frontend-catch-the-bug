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

    it("follows every breakpoint, up and down", () => {
        render(<ResponsiveGrid />);
        const observer = FakeResizeObserver.instances[0];
        const columns = () => screen.getByTestId("columns").textContent;

        act(() => observer.trigger(400));
        expect(columns()).toBe("1");

        // The boundaries belong to the wider bucket.
        act(() => observer.trigger(600));
        expect(columns()).toBe("2");
        act(() => observer.trigger(899));
        expect(columns()).toBe("2");
        act(() => observer.trigger(900));
        expect(columns()).toBe("3");

        // Shrinking has to walk back down too.
        act(() => observer.trigger(500));
        expect(columns()).toBe("1");
        expect(screen.getByTestId("width")).toHaveTextContent("500");
        expect(screen.getByTestId("grid")).toHaveStyle({
            gridTemplateColumns: "repeat(1, 1fr)",
        });
    });

    it("keeps one observer for the component's life", () => {
        const { unmount } = render(<ResponsiveGrid />);
        const observer = FakeResizeObserver.instances[0];

        act(() => observer.trigger(1000));
        act(() => observer.trigger(400));

        // Re-observing on every render is the other way to leak.
        expect(FakeResizeObserver.instances).toHaveLength(1);
        expect(observer.targets).toHaveLength(1);

        unmount();
        expect(observer.disconnected).toBe(true);
    });

    it("renders all six grid cells", () => {
        render(<ResponsiveGrid />);

        expect(screen.getAllByTestId("cell")).toHaveLength(6);
    });
});
