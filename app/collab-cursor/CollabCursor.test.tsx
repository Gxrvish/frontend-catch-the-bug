// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CollabCursor } from "./CollabCursor";
import { _resetCursorStore, getMoveCount } from "./cursorStore";

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
