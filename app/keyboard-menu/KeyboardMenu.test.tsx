// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetActionLog, getActionLog, KeyboardMenu } from "./KeyboardMenu";

const openMenu = () => {
    render(<KeyboardMenu />);
    const trigger = screen.getByTestId("trigger");
    trigger.focus();
    fireEvent.click(trigger);
    return trigger;
};

const items = () => screen.getAllByTestId("item") as HTMLButtonElement[];

describe("KeyboardMenu", () => {
    beforeEach(() => {
        _resetActionLog();
    });

    it("keeps Tab inside the open menu", () => {
        openMenu();
        const menuItems = items();
        // The menu opens with the first item focused; tabbing backwards out
        // of it must wrap around to the last item, not leave the menu.
        expect(document.activeElement).toBe(menuItems[0]);

        fireEvent.keyDown(menuItems[0], { key: "Tab", shiftKey: true });

        expect(document.activeElement).toBe(menuItems[3]);
    });

    it("returns focus to the trigger when the menu closes", () => {
        const trigger = openMenu();

        fireEvent.keyDown(screen.getByTestId("menu"), { key: "Escape" });

        expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
        expect(document.activeElement).toBe(trigger);
    });

    it("moves focus with the arrow keys and keeps one tab stop", () => {
        openMenu();

        // Roving tabindex: only the active item is reachable with Tab.
        expect(items().map((item) => item.tabIndex)).toEqual([0, -1, -1, -1]);

        fireEvent.keyDown(items()[0], { key: "ArrowDown" });

        expect(document.activeElement).toBe(items()[1]);
        expect(items().map((item) => item.tabIndex)).toEqual([-1, 0, -1, -1]);
    });

    it("walks Tab forward through the menu and wraps at the end", () => {
        openMenu();

        fireEvent.keyDown(items()[0], { key: "Tab" });
        expect(document.activeElement).toBe(items()[1]);

        fireEvent.keyDown(items()[1], { key: "Tab" });
        fireEvent.keyDown(items()[2], { key: "Tab" });
        expect(document.activeElement).toBe(items()[3]);

        // Forward off the end wraps too — a trap has two edges.
        fireEvent.keyDown(items()[3], { key: "Tab" });
        expect(document.activeElement).toBe(items()[0]);
    });

    it("walks back up with ArrowUp and stops at the top", () => {
        openMenu();

        fireEvent.keyDown(items()[0], { key: "ArrowDown" });
        fireEvent.keyDown(items()[1], { key: "ArrowDown" });
        expect(document.activeElement).toBe(items()[2]);

        fireEvent.keyDown(items()[2], { key: "ArrowUp" });
        expect(document.activeElement).toBe(items()[1]);
        expect(items().map((item) => item.tabIndex)).toEqual([-1, 0, -1, -1]);

        fireEvent.keyDown(items()[1], { key: "ArrowUp" });
        fireEvent.keyDown(items()[0], { key: "ArrowUp" });
        expect(document.activeElement).toBe(items()[0]);
        expect(items().map((item) => item.tabIndex)).toEqual([0, -1, -1, -1]);
    });

    it("returns focus to the trigger after running an action", () => {
        const trigger = openMenu();

        fireEvent.click(screen.getByText("Export"));

        // Escape is not the only way out of the menu.
        expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
        expect(document.activeElement).toBe(trigger);
    });

    it("runs the clicked action once and closes the menu", () => {
        openMenu();

        fireEvent.click(screen.getByText("Export"));

        expect(getActionLog()).toEqual(["Export"]);
        expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
    });
});
