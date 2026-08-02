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

    it("keeps one hub subscription and drops it on unmount", () => {
        const { unmount } = render(<ToastHub />);

        fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
        fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
        expect(handlerCount("toast")).toBe(1);

        unmount();

        expect(handlerCount("toast")).toBe(0);
    });

    it("detaches each bell independently", () => {
        const first = render(<Bell />);
        const second = render(<Bell />);
        expect(handlerCount("alert")).toBe(2);

        first.unmount();
        expect(handlerCount("alert")).toBe(1);

        second.unmount();
        expect(handlerCount("alert")).toBe(0);
    });

    it("uses the subscriber list as it stood when the emit began", () => {
        const seen: string[] = [];

        let offSelf = () => {};
        offSelf = on("y", () => {
            seen.push("self");
            // Unsubscribing yourself mid-emit is allowed…
            offSelf();
            // …and a handler added now belongs to the *next* emit.
            on("y", () => seen.push("late"));
        });
        on("y", () => seen.push("other"));

        emit("y", "go");
        expect(seen).toEqual(["self", "other"]);

        seen.length = 0;
        emit("y", "again");
        expect(seen).toEqual(["other", "late"]);
    });

    it("delivers a single published toast", () => {
        render(<ToastHub />);

        fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

        expect(screen.getAllByTestId("toast")).toHaveLength(1);
    });
});
