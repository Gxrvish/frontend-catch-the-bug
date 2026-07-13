// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CopyInvite, INVITE_LINK } from "./CopyInvite";

class FakeClipboard {
    written: string[] = [];
    private pending: Array<(value?: unknown) => void> = [];

    writeText = (text: string) =>
        new Promise((resolve) => {
            this.written.push(text);
            this.pending.push(resolve);
        });

    // test driver: the OS finishes the write
    flush() {
        this.pending.forEach((resolve) => resolve());
        this.pending = [];
    }
}

let clipboard: FakeClipboard;

describe("CopyInvite", () => {
    beforeEach(() => {
        clipboard = new FakeClipboard();
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: clipboard,
        });
    });

    afterEach(() => {
        delete (navigator as { clipboard?: unknown }).clipboard;
    });

    it("only says Copied once the clipboard write has finished", async () => {
        render(<CopyInvite />);

        fireEvent.click(screen.getByTestId("copy"));

        // The write is still in flight — claiming success now is a lie.
        expect(screen.getByTestId("status")).toHaveTextContent("Copying…");

        await act(async () => clipboard.flush());

        expect(screen.getByTestId("status")).toHaveTextContent("Copied!");
    });

    it("copies the full invite link, not the shortened pill", async () => {
        render(<CopyInvite />);

        fireEvent.click(screen.getByTestId("copy"));
        await act(async () => clipboard.flush());

        expect(clipboard.written).toEqual([INVITE_LINK]);
    });

    it("performs exactly one clipboard write per click", async () => {
        render(<CopyInvite />);

        fireEvent.click(screen.getByTestId("copy"));
        await act(async () => clipboard.flush());

        expect(clipboard.written).toHaveLength(1);
    });
});
