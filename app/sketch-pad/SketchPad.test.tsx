// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SketchPad } from "./SketchPad";

const kindsOnCanvas = () =>
    screen
        .queryAllByTestId("shape")
        .map((shape) => shape.getAttribute("data-kind"));

describe("SketchPad", () => {
    it("undo restores the canvas as it was before the last edit", () => {
        render(<SketchPad />);

        fireEvent.click(screen.getByRole("button", { name: "Add square" }));
        fireEvent.click(screen.getByRole("button", { name: "Add circle" }));
        fireEvent.click(screen.getByRole("button", { name: "Undo" }));

        expect(kindsOnCanvas()).toEqual(["square"]);
    });

    it("a new edit after undo discards the redo future", () => {
        render(<SketchPad />);

        fireEvent.click(screen.getByRole("button", { name: "Add square" }));
        fireEvent.click(screen.getByRole("button", { name: "Undo" }));
        fireEvent.click(screen.getByRole("button", { name: "Add circle" }));
        fireEvent.click(screen.getByRole("button", { name: "Redo" }));

        expect(kindsOnCanvas()).toEqual(["circle"]);
    });

    it("adds shapes to the canvas in order", () => {
        render(<SketchPad />);

        expect(screen.getByText("The canvas is empty.")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Add square" }));
        fireEvent.click(screen.getByRole("button", { name: "Add triangle" }));

        expect(kindsOnCanvas()).toEqual(["square", "triangle"]);
    });
});
