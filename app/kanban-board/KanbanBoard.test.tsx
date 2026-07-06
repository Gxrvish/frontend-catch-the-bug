// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KanbanBoard } from "./KanbanBoard";

describe("KanbanBoard", () => {
    it("moves a card to the next column when its arrow is clicked", () => {
        render(<KanbanBoard />);

        fireEvent.click(
            screen.getByLabelText("move Design login screen forward")
        );

        const doing = within(screen.getByTestId("column-doing"));
        const todo = within(screen.getByTestId("column-todo"));

        expect(doing.getByText("Design login screen")).toBeInTheDocument();
        expect(todo.queryByText("Design login screen")).not.toBeInTheDocument();
    });

    it("renders every seeded card in its starting column", () => {
        render(<KanbanBoard />);

        const todo = within(screen.getByTestId("column-todo"));
        const doing = within(screen.getByTestId("column-doing"));
        const done = within(screen.getByTestId("column-done"));

        expect(todo.getByText("Design login screen")).toBeInTheDocument();
        expect(todo.getByText("Write onboarding email")).toBeInTheDocument();
        expect(doing.getByText("Migrate billing webhooks")).toBeInTheDocument();
        expect(done.getByText("Rotate API keys")).toBeInTheDocument();
    });
});
