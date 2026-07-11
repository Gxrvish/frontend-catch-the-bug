// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PhotoGallery } from "./PhotoGallery";

describe("PhotoGallery", () => {
    it("does not open the lightbox when dismissing the delete dialog", () => {
        render(<PhotoGallery />);

        fireEvent.click(screen.getByLabelText("delete Harbor Sunrise"));
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();
    });

    it("keeps the dialog open when clicking inside it", () => {
        render(<PhotoGallery />);

        fireEvent.click(screen.getByLabelText("delete Foggy Pier"));
        fireEvent.click(screen.getByText("Delete this photo?"));

        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    });

    it("opens the lightbox from a card and deletes via the dialog", () => {
        render(<PhotoGallery />);

        const grid = screen.getByTestId("photo-grid");
        expect(within(grid).getAllByTestId("photo-card")).toHaveLength(6);

        fireEvent.click(within(grid).getAllByTestId("photo-card")[0]);
        expect(screen.getByTestId("lightbox")).toHaveTextContent(
            "Harbor Sunrise"
        );
        fireEvent.click(screen.getByLabelText("close lightbox"));
        expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("delete Winter Canal"));
        fireEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(
            within(grid).queryByText("Winter Canal")
        ).not.toBeInTheDocument();
        expect(within(grid).getAllByTestId("photo-card")).toHaveLength(5);
    });
});
