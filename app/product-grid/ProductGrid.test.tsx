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
});
