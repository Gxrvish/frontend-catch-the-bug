// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectTracker } from "./ProjectTracker";

describe("ProjectTracker", () => {
    it("shows a rename from the task panel on the sprint board", async () => {
        render(<ProjectTracker />);

        const input = await screen.findByLabelText("rename Fix login redirect");
        fireEvent.change(input, {
            target: { value: "Fix login redirect (v2)" },
        });

        expect(
            within(screen.getByTestId("sprint-board")).getByText(
                "Fix login redirect (v2)"
            )
        ).toBeInTheDocument();
    });

    it("removes a task from the task panel when it is deleted on the board", async () => {
        render(<ProjectTracker />);

        const board = await screen.findByTestId("sprint-board");
        fireEvent.click(
            within(board).getByLabelText("delete Write release notes")
        );

        expect(
            within(screen.getByTestId("my-tasks")).queryByDisplayValue(
                "Write release notes"
            )
        ).not.toBeInTheDocument();
    });

    it("loads the same five tasks into both panels", async () => {
        render(<ProjectTracker />);

        const myTasks = await screen.findByTestId("my-tasks");
        expect(within(myTasks).getAllByTestId("my-task-row")).toHaveLength(5);

        const board = screen.getByTestId("sprint-board");
        const cards = within(board).getAllByTestId("board-card");
        expect(cards.map((card) => card.textContent?.replace("✕", ""))).toEqual(
            [
                "Fix login redirect",
                "Write release notes",
                "Audit bundle size",
                "Migrate avatar uploads",
                "Polish empty states",
            ]
        );
    });
});
