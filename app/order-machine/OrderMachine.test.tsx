// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderMachine } from "./OrderMachine";
import {
    type LineItem,
    makeInitialOrder,
    orderReducer,
    type OrderState,
} from "./orderReducer";

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

    it("keeps the subtotal in sync across several adds", () => {
        render(<OrderMachine />);

        fireEvent.click(screen.getByRole("button", { name: "Add item" }));
        fireEvent.click(screen.getByRole("button", { name: "Add item" }));

        expect(screen.getAllByTestId("line-item")).toHaveLength(3);
        expect(screen.getByTestId("subtotal")).toHaveTextContent("$20");
    });

    it("refuses to pay a second time", () => {
        render(<OrderMachine />);

        fireEvent.click(screen.getByRole("button", { name: "Review" }));
        fireEvent.click(screen.getByRole("button", { name: "Pay" }));
        const firstId = screen.getByTestId("order-id").textContent;

        fireEvent.click(screen.getByRole("button", { name: "Pay" }));

        // A finished order is not a payable one; charging again would be
        // a second charge.
        expect(screen.getByTestId("order-status")).toHaveTextContent("done");
        expect(screen.getByTestId("order-id").textContent).toBe(firstId);
    });

    it("does not mutate the state it is given", () => {
        const cart: OrderState = Object.freeze({
            status: "cart",
            items: Object.freeze([
                { id: "seed", name: "Starter Plan", price: 10 },
            ]) as LineItem[],
            orderId: null,
        }) as OrderState;

        const next = orderReducer(cart, {
            type: "addItem",
            item: { id: "x-1", name: "Add-on 1", price: 5 },
        });

        expect(cart.items).toHaveLength(1);
        expect(next.items).toHaveLength(2);
        // A new array, not the old one with something appended.
        expect(next.items).not.toBe(cart.items);
    });

    it("resets to a cart that is not shared with the old one", () => {
        const cart = makeInitialOrder();
        const withItem = orderReducer(cart, {
            type: "addItem",
            item: { id: "x-1", name: "Add-on 1", price: 5 },
        });

        const fresh = orderReducer(withItem, { type: "reset" });

        expect(fresh.items).toHaveLength(1);
        expect(fresh.status).toBe("cart");
        expect(fresh.orderId).toBeNull();
        // The seed the first cart started from must not have grown.
        expect(cart.items).toHaveLength(1);
        expect(fresh.items).not.toBe(withItem.items);
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
