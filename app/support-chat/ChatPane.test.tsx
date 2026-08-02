// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatPane } from "./ChatPane";
import { emitAgentMessage } from "./supportChatApi";

const MESSAGE_HEIGHT_PX = 100;
const VIEWPORT_HEIGHT_PX = 300;

/**
 * jsdom does no layout, so we fake the scroll geometry: every message is
 * 100px tall and the viewport shows 300px.
 */
function mockScrollGeometry(el: HTMLElement): void {
    let scrollTop = 0;
    Object.defineProperty(el, "scrollTop", {
        get: () => scrollTop,
        set: (value: number) => {
            scrollTop = value;
        },
        configurable: true,
    });
    Object.defineProperty(el, "scrollHeight", {
        get: () =>
            el.querySelectorAll("[data-message]").length * MESSAGE_HEIGHT_PX,
        configurable: true,
    });
    Object.defineProperty(el, "clientHeight", {
        value: VIEWPORT_HEIGHT_PX,
        configurable: true,
    });
}

describe("ChatPane", () => {
    it("scrolls all the way down to a message the user just sent", () => {
        render(<ChatPane autoAgentReplies={false} />);
        const scroller = screen.getByTestId("chat-scroller");
        mockScrollGeometry(scroller);

        fireEvent.change(screen.getByPlaceholderText("Type a message..."), {
            target: { value: "Any update on my order?" },
        });
        fireEvent.click(screen.getByText("Send"));

        // After the new message is committed, the pane must rest at the very
        // bottom — not one message short of it.
        expect(scroller.scrollTop).toBe(scroller.scrollHeight);
    });

    it("does not yank a user who scrolled up, and counts unseen messages", () => {
        render(<ChatPane autoAgentReplies={false} />);
        const scroller = screen.getByTestId("chat-scroller");
        mockScrollGeometry(scroller);

        // User scrolls up to read history (6 seed messages = 600px tall,
        // viewport 300px, so scrollTop 0 is far from the bottom).
        scroller.scrollTop = 0;
        fireEvent.scroll(scroller);

        act(() => {
            emitAgentMessage("Here is that update you asked for!");
        });

        // Reading position must be preserved...
        expect(scroller.scrollTop).toBe(0);
        // ...and the unseen pill must appear instead.
        expect(screen.getByText(/1 new message/)).toBeInTheDocument();
    });

    it("counts several unseen messages and clears them on the way back down", () => {
        render(<ChatPane autoAgentReplies={false} />);
        const scroller = screen.getByTestId("chat-scroller");
        mockScrollGeometry(scroller);

        scroller.scrollTop = 0;
        fireEvent.scroll(scroller);

        act(() => {
            emitAgentMessage("one");
            emitAgentMessage("two");
            emitAgentMessage("three");
        });

        expect(scroller.scrollTop).toBe(0);
        expect(screen.getByText(/3 new messages/)).toBeInTheDocument();

        // Scrolling back to the bottom acknowledges them…
        scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;
        fireEvent.scroll(scroller);
        expect(screen.queryByText(/new message/)).not.toBeInTheDocument();

        // …and auto-scroll resumes from there.
        act(() => {
            emitAgentMessage("four");
        });
        expect(scroller.scrollTop).toBe(scroller.scrollHeight);
        expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
    });

    it("jumps to the latest from the unseen pill", () => {
        render(<ChatPane autoAgentReplies={false} />);
        const scroller = screen.getByTestId("chat-scroller");
        mockScrollGeometry(scroller);

        scroller.scrollTop = 0;
        fireEvent.scroll(scroller);
        act(() => {
            emitAgentMessage("hello again");
        });

        fireEvent.click(screen.getByText(/1 new message/));

        expect(scroller.scrollTop).toBe(scroller.scrollHeight);
        expect(screen.queryByText(/new message/)).not.toBeInTheDocument();
    });

    it("sends several messages and stays pinned to the bottom", () => {
        render(<ChatPane autoAgentReplies={false} />);
        const scroller = screen.getByTestId("chat-scroller");
        mockScrollGeometry(scroller);
        const input = screen.getByPlaceholderText("Type a message...");

        for (const text of ["first", "second", "third"]) {
            fireEvent.change(input, { target: { value: text } });
            fireEvent.click(screen.getByText("Send"));
            expect(scroller.scrollTop).toBe(scroller.scrollHeight);
        }

        // An empty message adds nothing and moves nothing.
        const before = scroller.scrollHeight;
        fireEvent.change(input, { target: { value: "   " } });
        fireEvent.click(screen.getByText("Send"));
        expect(scroller.scrollHeight).toBe(before);
    });
});
