// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HotkeyNav } from "./HotkeyNav";

const selectedFolder = () =>
    screen
        .getAllByTestId("folder")
        .find((folder) => folder.dataset.selected === "true")?.textContent;

const spare: HTMLElement[] = [];

/** An editable control that is not the component's own search box. */
const editable = (tag: "textarea" | "select" | "div") => {
    const el = document.createElement(tag);
    if (tag === "div") {
        // jsdom ships the attribute but not the property a real browser
        // derives from it, so set both and let either guard style work.
        el.setAttribute("contenteditable", "true");
        Object.defineProperty(el, "isContentEditable", {
            value: true,
            configurable: true,
        });
    }
    document.body.appendChild(el);
    spare.push(el);
    return el;
};

afterEach(() => {
    spare.splice(0).forEach((el) => el.remove());
    vi.restoreAllMocks();
});

describe("HotkeyNav", () => {
    it("does not hijack typing in the search field", () => {
        render(<HotkeyNav />);
        const search = screen.getByTestId("search");
        search.focus();

        fireEvent.keyDown(search, { key: "j" });
        fireEvent.keyDown(search, { key: "j" });

        expect(selectedFolder()).toBe("Inbox");
    });

    it("stands down for every editable target, not just the search box", () => {
        render(<HotkeyNav />);

        fireEvent.keyDown(editable("textarea"), { key: "j" });
        fireEvent.keyDown(editable("select"), { key: "j" });
        fireEvent.keyDown(editable("div"), { key: "j" });

        // A guard that only names `input` leaves every other editable
        // control being typed into by the shortcut map.
        expect(selectedFolder()).toBe("Inbox");
    });

    it("treats cmd+K as the palette shortcut only", () => {
        render(<HotkeyNav />);
        fireEvent.keyDown(document.body, { key: "j" });
        expect(selectedFolder()).toBe("Starred");

        const notCancelled = fireEvent.keyDown(document.body, {
            key: "k",
            metaKey: true,
        });

        expect(screen.getByTestId("palette")).toBeInTheDocument();
        // The plain-k list movement must not fire on a modifier combo…
        expect(selectedFolder()).toBe("Starred");
        // …and the browser default for ⌘K must be suppressed.
        expect(notCancelled).toBe(false);
    });

    it("ignores j and k whenever a modifier is held", () => {
        render(<HotkeyNav />);

        fireEvent.keyDown(document.body, { key: "j", ctrlKey: true });
        fireEvent.keyDown(document.body, { key: "j", altKey: true });
        expect(selectedFolder()).toBe("Inbox");

        // Walk to the bottom with real presses, then try to come back up
        // with a combo the app never claimed.
        for (let i = 0; i < 6; i += 1) {
            fireEvent.keyDown(document.body, { key: "j" });
        }
        expect(selectedFolder()).toBe("Trash");

        fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
        expect(selectedFolder()).toBe("Trash");

        // Plain keys are the app's own — and must stay uncancelled.
        expect(fireEvent.keyDown(document.body, { key: "k" })).toBe(true);
        expect(selectedFolder()).toBe("Archive");
    });

    it("opens the palette even while the search field has focus", () => {
        const add = vi.spyOn(document, "addEventListener");
        const remove = vi.spyOn(document, "removeEventListener");
        const keydowns = (spy: typeof add) =>
            spy.mock.calls.filter((call) => call[0] === "keydown").length;

        render(<HotkeyNav />);
        const search = screen.getByTestId("search");
        search.focus();

        const notCancelled = fireEvent.keyDown(search, {
            key: "k",
            metaKey: true,
        });

        // A combo the app claims outranks the editable-target guard.
        expect(screen.getByTestId("palette")).toBeInTheDocument();
        expect(selectedFolder()).toBe("Inbox");
        expect(notCancelled).toBe(false);

        expect(keydowns(add)).toBe(1);
        cleanup();
        expect(keydowns(remove)).toBe(1);
    });

    it("moves the selection with plain j/k on the page", () => {
        render(<HotkeyNav />);

        fireEvent.keyDown(document.body, { key: "j" });
        fireEvent.keyDown(document.body, { key: "j" });
        fireEvent.keyDown(document.body, { key: "k" });

        expect(selectedFolder()).toBe("Starred");
    });
});
