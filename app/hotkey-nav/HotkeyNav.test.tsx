// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HotkeyNav } from "./HotkeyNav";

const selectedFolder = () =>
    screen
        .getAllByTestId("folder")
        .find((folder) => folder.dataset.selected === "true")?.textContent;

describe("HotkeyNav", () => {
    it("does not hijack typing in the search field", () => {
        render(<HotkeyNav />);
        const search = screen.getByTestId("search");
        search.focus();

        fireEvent.keyDown(search, { key: "j" });
        fireEvent.keyDown(search, { key: "j" });

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

    it("moves the selection with plain j/k on the page", () => {
        render(<HotkeyNav />);

        fireEvent.keyDown(document.body, { key: "j" });
        fireEvent.keyDown(document.body, { key: "j" });
        fireEvent.keyDown(document.body, { key: "k" });

        expect(selectedFolder()).toBe("Starred");
    });
});
