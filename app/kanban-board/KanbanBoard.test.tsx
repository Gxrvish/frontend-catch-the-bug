// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KanbanBoard } from "./KanbanBoard";

const heading = (column: string) =>
    screen.getByTestId(`column-${column}`).querySelector("h3");

const titles = (column: string) =>
    within(screen.getByTestId(`column-${column}`))
        .getAllByRole("listitem")
        .map((li) => li.textContent?.replace("→", "").trim());

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

    it("moves the same card forward twice", () => {
        render(<KanbanBoard />);

        fireEvent.click(
            screen.getByLabelText("move Design login screen forward")
        );
        fireEvent.click(
            screen.getByLabelText("move Design login screen forward")
        );

        const done = within(screen.getByTestId("column-done"));
        const doing = within(screen.getByTestId("column-doing"));
        expect(done.getByText("Design login screen")).toBeInTheDocument();
        expect(
            doing.queryByText("Design login screen")
        ).not.toBeInTheDocument();
    });

    it("keeps the column counts in step with the cards", () => {
        render(<KanbanBoard />);

        fireEvent.click(
            screen.getByLabelText("move Design login screen forward")
        );

        expect(heading("todo")).toHaveTextContent("To do (1)");
        expect(heading("doing")).toHaveTextContent("In progress (2)");
        expect(heading("done")).toHaveTextContent("Done (1)");
    });

    it("leaves the other cards where they are", () => {
        render(<KanbanBoard />);

        fireEvent.click(
            screen.getByLabelText("move Design login screen forward")
        );

        expect(titles("todo")).toEqual(["Write onboarding email"]);
        // The moved card joins the end of its new column; the card
        // already there keeps its place.
        expect(titles("doing")).toEqual([
            "Migrate billing webhooks",
            "Design login screen",
        ]);
        expect(titles("done")).toEqual(["Rotate API keys"]);
    });

    it("does not need an unrelated state change to repaint", () => {
        render(<KanbanBoard />);

        fireEvent.click(
            screen.getByLabelText("move Design login screen forward")
        );
        expect(titles("doing")).toContain("Design login screen");

        fireEvent.click(
            screen.getByRole("button", { name: "Toggle dark mode" })
        );

        // The toggle repaints; it must not be what reveals the move, and
        // it must not move anything of its own.
        expect(titles("todo")).toEqual(["Write onboarding email"]);
        expect(titles("doing")).toEqual([
            "Migrate billing webhooks",
            "Design login screen",
        ]);
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
