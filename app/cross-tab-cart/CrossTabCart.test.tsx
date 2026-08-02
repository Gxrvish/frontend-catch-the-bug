// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartTab } from "./CrossTabCart";

type CartMessage = { qty: number };

class FakeBroadcastChannel {
    static instances: FakeBroadcastChannel[] = [];

    name: string;
    closed = false;
    posts: CartMessage[] = [];
    received: CartMessage[] = [];
    onmessage: ((event: MessageEvent<CartMessage>) => void) | null = null;

    constructor(name: string) {
        this.name = name;
        FakeBroadcastChannel.instances.push(this);
    }

    private dispatch(data: CartMessage) {
        this.received.push(data);
        this.onmessage?.({ data } as MessageEvent<CartMessage>);
    }

    postMessage(data: CartMessage) {
        this.posts.push(data);
        FakeBroadcastChannel.instances
            .filter((c) => c !== this && c.name === this.name && !c.closed)
            .forEach((c) => c.dispatch(data));
    }

    close() {
        this.closed = true;
    }

    // test driver: simulate a message arriving from another tab
    deliver(data: CartMessage) {
        this.dispatch(data);
    }
}

const increment = (label: string) =>
    fireEvent.click(screen.getByRole("button", { name: `Increment ${label}` }));

const count = (label: string) => screen.getByTestId(`count-${label}`);

describe("CrossTabCart", () => {
    beforeEach(() => {
        FakeBroadcastChannel.instances = [];
        vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("updates its own quantity when you act locally", () => {
        render(<CartTab label="A" />);

        fireEvent.click(screen.getByRole("button", { name: "Increment A" }));

        expect(screen.getByTestId("count-A")).toHaveTextContent("1");
    });

    it("keeps a second tab in step with a local increment", () => {
        render(
            <>
                <CartTab label="A" />
                <CartTab label="B" />
            </>
        );

        const [channelA, channelB] = FakeBroadcastChannel.instances;
        increment("A");

        // Updating locally and forgetting to announce it is the other
        // half of this bug.
        expect(count("A")).toHaveTextContent("1");
        expect(count("B")).toHaveTextContent("1");
        // One announcement, from the tab that acted. B agreeing because
        // it echoed the message back is not synchronisation.
        expect(channelA.posts).toEqual([{ qty: 1 }]);
        expect(channelB.posts).toEqual([]);
    });

    it("counts repeated local increments", () => {
        render(
            <>
                <CartTab label="A" />
                <CartTab label="B" />
            </>
        );

        const [channelA, channelB] = FakeBroadcastChannel.instances;
        increment("A");
        increment("A");

        expect(count("A")).toHaveTextContent("2");
        expect(count("B")).toHaveTextContent("2");
        expect(channelA.posts).toEqual([{ qty: 1 }, { qty: 2 }]);
        expect(channelB.posts).toEqual([]);
    });

    it("does not re-broadcast a message it received", () => {
        render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];

        act(() => channel.deliver({ qty: 5 }));

        expect(channel.posts).toHaveLength(0);
    });

    it("still announces a local increment made after receiving one", () => {
        render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];

        act(() => channel.deliver({ qty: 5 }));
        increment("A");

        // Silence on receive must not turn into silence on act.
        expect(count("A")).toHaveTextContent("6");
        expect(channel.posts).toEqual([{ qty: 6 }]);
    });

    it("closes its channel on unmount", () => {
        const { unmount } = render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];
        expect(channel.closed).toBe(false);

        unmount();

        expect(channel.closed).toBe(true);
    });

    it("stops receiving once the tab is gone", () => {
        render(<CartTab label="A" />);
        const tabB = render(<CartTab label="B" />);
        const [, channelB] = FakeBroadcastChannel.instances;

        tabB.unmount();
        increment("A");

        expect(channelB.closed).toBe(true);
        expect(channelB.received).toEqual([]);
        // One channel per tab — reopening on every render is its own leak.
        expect(FakeBroadcastChannel.instances).toHaveLength(2);
    });

    it("applies an incoming quantity from another tab", () => {
        render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];

        act(() => channel.deliver({ qty: 3 }));

        expect(screen.getByTestId("count-A")).toHaveTextContent("3");
    });
});
