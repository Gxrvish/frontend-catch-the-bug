// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _resetDeliveries, getDeliveries, WsTicker } from "./WsTicker";

type MessageEventLike = { data: string };

class FakeWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    static instances: FakeWebSocket[] = [];

    url: string;
    readyState = FakeWebSocket.CONNECTING;
    sent: string[] = [];
    onopen: (() => void) | null = null;
    onmessage: ((event: MessageEventLike) => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(url: string) {
        this.url = url;
        FakeWebSocket.instances.push(this);
    }

    send(data: string) {
        if (this.readyState === FakeWebSocket.OPEN) {
            this.sent.push(data);
        }
    }

    close() {
        this.readyState = FakeWebSocket.CLOSED;
        this.onclose?.();
    }

    // --- test drivers ---
    open() {
        this.readyState = FakeWebSocket.OPEN;
        this.onopen?.();
    }

    message(data: string) {
        this.onmessage?.({ data });
    }
}

const openSockets = () =>
    FakeWebSocket.instances.filter(
        (ws) => ws.readyState === FakeWebSocket.OPEN
    );

const messageAllOpen = (data: string) => {
    openSockets().forEach((ws) => ws.message(data));
};

describe("WsTicker", () => {
    beforeEach(() => {
        _resetDeliveries();
        FakeWebSocket.instances = [];
        vi.stubGlobal("WebSocket", FakeWebSocket);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("closes the old socket when it reconnects to a new symbol", () => {
        render(<WsTicker />);
        act(() => FakeWebSocket.instances[0].open());

        fireEvent.click(screen.getByRole("button", { name: "Switch symbol" }));
        act(() => FakeWebSocket.instances[1].open());

        _resetDeliveries();
        act(() => messageAllOpen("X"));

        expect(getDeliveries()).toBe(1);
    });

    it("appends every message instead of overwriting", () => {
        render(<WsTicker />);
        act(() => FakeWebSocket.instances[0].open());

        act(() => FakeWebSocket.instances[0].message("A"));
        act(() => FakeWebSocket.instances[0].message("B"));

        expect(
            screen.getAllByTestId("tick").map((el) => el.textContent)
        ).toEqual(["A", "B"]);
    });

    it("delivers a message submitted before the socket opened", () => {
        render(<WsTicker />);

        fireEvent.click(screen.getByRole("button", { name: "Send ping" }));
        act(() => FakeWebSocket.instances[0].open());

        expect(FakeWebSocket.instances[0].sent).toContain("ping");
    });

    it("renders a single received message once", () => {
        render(<WsTicker />);
        act(() => FakeWebSocket.instances[0].open());

        act(() => FakeWebSocket.instances[0].message("hello"));

        const ticks = screen.getAllByTestId("tick");
        expect(ticks).toHaveLength(1);
        expect(ticks[0]).toHaveTextContent("hello");
    });
});
