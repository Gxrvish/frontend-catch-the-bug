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

    it("shows a rename of an in-progress task on the board", async () => {
        render(<ProjectTracker />);

        const input = await screen.findByLabelText(
            "rename Migrate avatar uploads"
        );
        fireEvent.change(input, { target: { value: "Migrate avatars (v2)" } });

        // The other status column is the same rule, not a second one.
        expect(
            within(screen.getByTestId("sprint-board")).getByText(
                "Migrate avatars (v2)"
            )
        ).toBeInTheDocument();
    });

    it("deletes an in-progress task from both panels", async () => {
        render(<ProjectTracker />);

        const board = await screen.findByTestId("sprint-board");
        fireEvent.click(
            within(board).getByLabelText("delete Polish empty states")
        );

        expect(
            within(screen.getByTestId("my-tasks")).getAllByTestId("my-task-row")
        ).toHaveLength(4);
        expect(within(board).getAllByTestId("board-card")).toHaveLength(4);
        expect(
            within(screen.getByTestId("my-tasks")).queryByDisplayValue(
                "Polish empty states"
            )
        ).not.toBeInTheDocument();
    });

    it("keeps both panels consistent through a rename then a delete", async () => {
        render(<ProjectTracker />);

        const input = await screen.findByLabelText("rename Audit bundle size");
        fireEvent.change(input, { target: { value: "Audit bundles" } });

        const board = screen.getByTestId("sprint-board");
        fireEvent.click(within(board).getByLabelText("delete Audit bundles"));

        // One record per task: the rename has to reach the board's delete
        // control, and the delete has to reach the task panel.
        expect(
            within(board).queryByText("Audit bundles")
        ).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId("my-tasks")).queryByDisplayValue(
                "Audit bundles"
            )
        ).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId("my-tasks")).getAllByTestId("my-task-row")
        ).toHaveLength(4);
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
