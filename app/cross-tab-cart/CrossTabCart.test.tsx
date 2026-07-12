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
    onmessage: ((event: MessageEvent<CartMessage>) => void) | null = null;

    constructor(name: string) {
        this.name = name;
        FakeBroadcastChannel.instances.push(this);
    }

    postMessage(data: CartMessage) {
        this.posts.push(data);
        FakeBroadcastChannel.instances
            .filter((c) => c !== this && c.name === this.name && !c.closed)
            .forEach((c) =>
                c.onmessage?.({ data } as MessageEvent<CartMessage>)
            );
    }

    close() {
        this.closed = true;
    }

    // test driver: simulate a message arriving from another tab
    deliver(data: CartMessage) {
        this.onmessage?.({ data } as MessageEvent<CartMessage>);
    }
}

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

    it("does not re-broadcast a message it received", () => {
        render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];

        act(() => channel.deliver({ qty: 5 }));

        expect(channel.posts).toHaveLength(0);
    });

    it("closes its channel on unmount", () => {
        const { unmount } = render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];
        expect(channel.closed).toBe(false);

        unmount();

        expect(channel.closed).toBe(true);
    });

    it("applies an incoming quantity from another tab", () => {
        render(<CartTab label="A" />);
        const channel = FakeBroadcastChannel.instances[0];

        act(() => channel.deliver({ qty: 3 }));

        expect(screen.getByTestId("count-A")).toHaveTextContent("3");
    });
});
