// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CollabCursor } from "./CollabCursor";
import { _resetCursorStore, getMoveCount, moveCursor } from "./cursorStore";

const move = (label: string) =>
    fireEvent.click(screen.getByRole("button", { name: label }));

const settle = () =>
    act(() => {
        vi.advanceTimersByTime(200);
    });

describe("CollabCursor", () => {
    beforeEach(() => {
        _resetCursorStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows a peer move that arrives during mount", () => {
        render(<CollabCursor />);

        expect(screen.getByTestId("pos-p-1")).toHaveTextContent("320, 240");
    });

    it("keeps following peer moves after mount", () => {
        render(<CollabCursor />);

        expect(screen.getByTestId("pos-p-1")).toHaveTextContent("320, 240");

        // Catching up at mount must not cost the live subscription.
        act(() => moveCursor("p-2", 55, 66));

        expect(screen.getByTestId("pos-p-2")).toHaveTextContent("55, 66");
    });

    it("collapses a burst of moves into one broadcast", () => {
        vi.useFakeTimers();
        render(<CollabCursor />);

        const before = getMoveCount();
        fireEvent.click(
            screen.getByRole("button", { name: "Move to 100,100" })
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Move to 200,150" })
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Move to 260,220" })
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Move to 300,300" })
        );

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(getMoveCount() - before).toBe(1);
    });

    it("broadcasts the last position of a burst, not the first", () => {
        vi.useFakeTimers();
        render(<CollabCursor />);

        const before = getMoveCount();
        move("Move to 100,100");
        move("Move to 200,150");
        move("Move to 260,220");
        move("Move to 300,300");
        settle();

        expect(getMoveCount() - before).toBe(1);
        // A leading-edge debounce also sends one — and sends the wrong one.
        expect(screen.getByTestId("pos-me")).toHaveTextContent("300, 300");
    });

    it("collapses every burst, not only the first", () => {
        vi.useFakeTimers();
        render(<CollabCursor />);

        const beforeFirst = getMoveCount();
        move("Move to 100,100");
        move("Move to 200,150");
        move("Move to 260,220");
        move("Move to 300,300");
        settle();
        expect(getMoveCount() - beforeFirst).toBe(1);

        // Broadcasting once and then going quiet is not debouncing.
        const beforeSecond = getMoveCount();
        move("Move to 100,100");
        move("Move to 260,220");
        settle();

        expect(getMoveCount() - beforeSecond).toBe(1);
        expect(screen.getByTestId("pos-me")).toHaveTextContent("260, 220");
    });

    it("keeps rendering peer moves in the middle of a local burst", () => {
        vi.useFakeTimers();
        render(<CollabCursor />);

        const before = getMoveCount();
        move("Move to 100,100");
        act(() => moveCursor("p-2", 55, 66));
        expect(screen.getByTestId("pos-p-2")).toHaveTextContent("55, 66");
        move("Move to 200,150");
        settle();

        // One relay move plus one collapsed broadcast — the re-render the
        // peer caused must not have spawned a second timer.
        expect(getMoveCount() - before).toBe(2);
        expect(screen.getByTestId("pos-me")).toHaveTextContent("200, 150");
    });

    it("renders peers and reflects a settled broadcast", () => {
        vi.useFakeTimers();
        render(<CollabCursor />);

        expect(screen.getByTestId("cursor-p-1")).toHaveTextContent("Mira");
        expect(screen.getByTestId("cursor-me")).toHaveTextContent("You");

        fireEvent.click(
            screen.getByRole("button", { name: "Move to 200,150" })
        );
        expect(screen.getByTestId("my-local-pos")).toHaveTextContent(
            "200, 150"
        );

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(screen.getByTestId("pos-me")).toHaveTextContent("200, 150");
    });
});
