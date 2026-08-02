// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CopyInvite, INVITE_LINK } from "./CopyInvite";

type Pending = {
    resolve: () => void;
    reject: (reason: unknown) => void;
};

class FakeClipboard {
    written: string[] = [];
    private pending: Pending[] = [];

    writeText = (text: string) => {
        this.written.push(text);
        const promise = new Promise<void>((resolve, reject) => {
            this.pending.push({ resolve, reject });
        });
        // Keep an internal handler so a component that never catches
        // doesn't take the whole run down with it — the component still
        // sees the rejection.
        promise.catch(() => {});
        return promise;
    };

    // test driver: the OS finishes the write
    flush() {
        this.pending.forEach((p) => p.resolve());
        this.pending = [];
    }

    // test driver: the OS refuses the write
    deny() {
        this.pending.forEach((p) => p.reject(new Error("NotAllowedError")));
        this.pending = [];
    }
}

let clipboard: FakeClipboard;

const status = () => screen.getByTestId("status");
const copyButton = () => screen.getByTestId("copy");

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

    it("reports a failure when the clipboard write is denied", async () => {
        render(<CopyInvite />);

        fireEvent.click(copyButton());
        await act(async () => clipboard.deny());

        // A rejected write is the case the promise exists for.
        expect(status()).toHaveTextContent("Copy failed");
    });

    it("labels the button with the same status as the readout", async () => {
        render(<CopyInvite />);

        fireEvent.click(copyButton());
        expect(copyButton()).toHaveTextContent("Copying…");

        await act(async () => clipboard.flush());
        expect(copyButton()).toHaveTextContent("Copied!");
    });

    it("runs the whole cycle again on a second click", async () => {
        render(<CopyInvite />);

        fireEvent.click(copyButton());
        await act(async () => clipboard.flush());
        expect(status()).toHaveTextContent("Copied!");

        fireEvent.click(copyButton());

        // The second copy is in flight; the first one's success is stale.
        expect(status()).toHaveTextContent("Copying…");
        await act(async () => clipboard.flush());
        expect(status()).toHaveTextContent("Copied!");
        expect(clipboard.written).toEqual([INVITE_LINK, INVITE_LINK]);
    });

    it("copies the full invite link, not the shortened pill", async () => {
        render(<CopyInvite />);

        fireEvent.click(screen.getByTestId("copy"));
        await act(async () => clipboard.flush());

        expect(clipboard.written).toEqual([INVITE_LINK]);
    });

    it("keeps the pill shortened while copying the full link", async () => {
        render(<CopyInvite />);

        fireEvent.click(copyButton());
        await act(async () => clipboard.flush());

        // Widening the pill to make the copy correct is not the repair.
        expect(screen.getByTestId("link-pill")).toHaveTextContent("…");
        expect(screen.getByTestId("link-pill").textContent).not.toBe(
            INVITE_LINK
        );
        expect(clipboard.written).toEqual([INVITE_LINK]);
    });

    it("performs exactly one clipboard write per click", async () => {
        render(<CopyInvite />);

        fireEvent.click(screen.getByTestId("copy"));
        await act(async () => clipboard.flush());

        expect(clipboard.written).toHaveLength(1);
    });
});
