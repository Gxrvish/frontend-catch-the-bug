// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductGrid } from "./ProductGrid";

describe("ProductGrid", () => {
    it("keeps quantity and added-state attached to the same product after sorting", () => {
        render(<ProductGrid />);

        // In "featured" order, Mechanical Keyboard (p-1, $129.99) is first.
        // Under "price-asc" it moves to the middle of the grid.
        const keyboard = within(screen.getByTestId("product-card-p-1"));

        fireEvent.change(keyboard.getByLabelText("quantity"), {
            target: { value: "5" },
        });
        fireEvent.click(keyboard.getByText("Add to Cart"));

        expect(keyboard.getByLabelText("quantity")).toHaveValue(5);
        expect(keyboard.getByText("Added ✓")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("sort order"), {
            target: { value: "price-asc" },
        });

        // The user's picks must follow the PRODUCT, not the grid position.
        const keyboardAfterSort = within(
            screen.getByTestId("product-card-p-1")
        );
        expect(keyboardAfterSort.getByLabelText("quantity")).toHaveValue(5);
        expect(keyboardAfterSort.getByText("Added ✓")).toBeInTheDocument();

        // And the product now sitting in the old first slot (Desk Lamp,
        // cheapest) must still be pristine.
        const lamp = within(screen.getByTestId("product-card-p-6"));
        expect(lamp.getByLabelText("quantity")).toHaveValue(1);
        expect(lamp.queryByText("Added ✓")).not.toBeInTheDocument();
    });

    it("keeps state attached when the category filter changes", () => {
        render(<ProductGrid />);

        // USB-C Hub sits fifth in "all" and third in "electronics".
        const hub = within(screen.getByTestId("product-card-p-5"));
        fireEvent.change(hub.getByLabelText("quantity"), {
            target: { value: "4" },
        });
        fireEvent.click(hub.getByText("Add to Cart"));

        fireEvent.click(screen.getByRole("button", { name: "electronics" }));

        const filtered = within(screen.getByTestId("product-card-p-5"));
        expect(filtered.getByLabelText("quantity")).toHaveValue(4);
        expect(filtered.getByText("Added ✓")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "all" }));

        const restored = within(screen.getByTestId("product-card-p-5"));
        expect(restored.getByLabelText("quantity")).toHaveValue(4);
        expect(restored.getByText("Added ✓")).toBeInTheDocument();
    });

    it("keeps state attached when sorting back to the original order", () => {
        render(<ProductGrid />);

        const keyboard = within(screen.getByTestId("product-card-p-1"));
        fireEvent.change(keyboard.getByLabelText("quantity"), {
            target: { value: "3" },
        });

        const sort = screen.getByLabelText("sort order");
        fireEvent.change(sort, { target: { value: "price-desc" } });
        expect(
            within(screen.getByTestId("product-card-p-1")).getByLabelText(
                "quantity"
            )
        ).toHaveValue(3);

        fireEvent.change(sort, { target: { value: "featured" } });

        // A round trip lands on the same layout — and must land on the
        // same state.
        expect(
            within(screen.getByTestId("product-card-p-1")).getByLabelText(
                "quantity"
            )
        ).toHaveValue(3);
    });

    it("renders the whole grid in the chosen order", () => {
        render(<ProductGrid />);

        fireEvent.change(
            within(screen.getByTestId("product-card-p-1")).getByLabelText(
                "quantity"
            ),
            { target: { value: "2" } }
        );

        fireEvent.change(screen.getByLabelText("sort order"), {
            target: { value: "price-asc" },
        });

        const ids = screen
            .getAllByTestId(/^product-card-/)
            .map((el) => el.getAttribute("data-testid"));
        expect(ids).toEqual([
            "product-card-p-6",
            "product-card-p-7",
            "product-card-p-5",
            "product-card-p-8",
            "product-card-p-1",
            "product-card-p-2",
            "product-card-p-4",
            "product-card-p-3",
        ]);
        // The quantity typed on the featured-first card went with it.
        expect(
            within(screen.getByTestId("product-card-p-1")).getByLabelText(
                "quantity"
            )
        ).toHaveValue(2);
    });
});
