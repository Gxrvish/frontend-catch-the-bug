// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderMachine } from "./OrderMachine";
import { orderReducer, type OrderState } from "./orderReducer";

describe("OrderMachine", () => {
    it("keeps the subtotal in sync when a line item is added", () => {
        render(<OrderMachine />);

        fireEvent.click(screen.getByRole("button", { name: "Add item" }));

        // Seed $10 + add-on $5 — the subtotal must follow the items.
        expect(screen.getByTestId("subtotal")).toHaveTextContent("$15");
    });

    it("refuses to pay straight from the cart", () => {
        render(<OrderMachine />);

        // No Review step — paying now is an illegal transition.
        fireEvent.click(screen.getByRole("button", { name: "Pay" }));

        expect(screen.getByTestId("order-status")).toHaveTextContent("cart");
        expect(screen.queryByTestId("order-id")).toBeNull();
    });

    it("is a pure function of (state, action)", () => {
        const reviewed: OrderState = {
            status: "review",
            items: [{ id: "seed", name: "Starter Plan", price: 10 }],
            orderId: null,
        };

        const first = orderReducer(reviewed, {
            type: "pay",
            paymentId: "PAY-1",
        });
        const second = orderReducer(reviewed, {
            type: "pay",
            paymentId: "PAY-1",
        });

        expect(first.orderId).toBe(second.orderId);
    });

    it("completes a legal cart to done flow", () => {
        render(<OrderMachine />);

        fireEvent.click(screen.getByRole("button", { name: "Add item" }));
        fireEvent.click(screen.getByRole("button", { name: "Review" }));
        fireEvent.click(screen.getByRole("button", { name: "Pay" }));

        expect(screen.getByTestId("order-status")).toHaveTextContent("done");
        expect(screen.getAllByTestId("line-item")).toHaveLength(2);
        expect(screen.getByTestId("order-id")).toBeInTheDocument();
    });
});
