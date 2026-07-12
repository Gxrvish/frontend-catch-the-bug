// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { Bell } from "./Bell";
import { _resetBus, emit, handlerCount, on } from "./eventBus";
import { ToastHub } from "./ToastHub";

describe("ToastBus", () => {
    beforeEach(() => {
        _resetBus();
    });

    it("shows one toast per publish, not one per past render", () => {
        render(<ToastHub />);

        fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
        fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

        expect(screen.getAllByTestId("toast")).toHaveLength(2);
    });

    it("detaches the bell's listener on unmount", () => {
        const { unmount } = render(<Bell />);
        expect(handlerCount("alert")).toBe(1);

        unmount();

        expect(handlerCount("alert")).toBe(0);
    });

    it("delivers an in-flight emit to every subscriber even if one unsubscribes another", () => {
        const seen: string[] = [];
        let offB = () => {};
        on("x", () => {
            seen.push("A");
            offB();
        });
        offB = on("x", () => seen.push("B"));

        emit("x", "go");

        expect(seen).toEqual(["A", "B"]);
    });

    it("delivers a single published toast", () => {
        render(<ToastHub />);

        fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

        expect(screen.getAllByTestId("toast")).toHaveLength(1);
    });
});
