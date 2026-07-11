// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _resetFeedApi, getFetchLog } from "./feedApi";
import { InfiniteFeed } from "./InfiniteFeed";

type IOEntry = { isIntersecting: boolean; target: Element };
type IOCallback = (entries: IOEntry[]) => void;

class FakeIntersectionObserver {
    static instances: FakeIntersectionObserver[] = [];
    callback: IOCallback;
    target: Element | null = null;
    disconnected = false;

    constructor(callback: IOCallback) {
        this.callback = callback;
        FakeIntersectionObserver.instances.push(this);
    }
    observe(el: Element) {
        this.target = el;
    }
    unobserve() {}
    disconnect() {
        this.disconnected = true;
    }
}

const fireIntersect = () => {
    FakeIntersectionObserver.instances
        .filter((io) => !io.disconnected && io.target)
        .forEach((io) =>
            io.callback([{ isIntersecting: true, target: io.target! }])
        );
};

const settle = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
    });
};

describe("InfiniteFeed", () => {
    beforeEach(() => {
        _resetFeedApi();
        FakeIntersectionObserver.instances = [];
        vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("fetches a page only once per intersection burst", async () => {
        render(<InfiniteFeed />);

        act(() => {
            fireIntersect();
            fireIntersect();
        });
        await settle();

        expect(getFetchLog()).toEqual(["0"]);
    });

    it("advances to the next cursor on the next intersection", async () => {
        render(<InfiniteFeed />);

        act(() => {
            fireIntersect();
        });
        await settle();

        act(() => {
            fireIntersect();
        });
        await settle();

        expect(getFetchLog()).toEqual(["0", "1"]);
    });

    it("preserves scroll position when older items are prepended", async () => {
        render(<InfiniteFeed />);

        act(() => {
            fireIntersect();
        });
        await settle();

        const scroller = screen.getByTestId("feed-scroller");
        scroller.scrollTop = 200;

        fireEvent.click(screen.getByRole("button", { name: "Load previous" }));
        await settle();

        // Five 40px items were prepended above the viewport; the reading
        // position must shift down by their height to stay put.
        expect(scroller.scrollTop).toBe(400);
    });

    it("renders the first page in order on the first intersection", async () => {
        render(<InfiniteFeed />);

        act(() => {
            fireIntersect();
        });
        await settle();

        const labels = screen
            .getAllByTestId("feed-item")
            .map((el) => el.textContent);
        expect(labels).toEqual([
            "Item 0",
            "Item 1",
            "Item 2",
            "Item 3",
            "Item 4",
        ]);
    });
});
