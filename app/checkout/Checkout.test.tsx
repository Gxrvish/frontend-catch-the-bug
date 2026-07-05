// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkout } from "./Checkout";

describe("Checkout", () => {
    it("updates the total immediately when a coupon is applied", () => {
        render(<Checkout />);

        // Seed cart: $100 + 2 × $50 = $200 subtotal + $5 standard shipping.
        expect(screen.getByTestId("total-amount")).toHaveTextContent("$205.00");

        fireEvent.change(screen.getByPlaceholderText("SAVE10"), {
            target: { value: "SAVE10" },
        });
        fireEvent.click(screen.getByText("Apply"));

        // 10% off the $200 subtotal = $20 discount.
        expect(screen.getByTestId("total-amount")).toHaveTextContent("$185.00");
    });

    it("does not re-render the Order Summary while typing a gift note", () => {
        const onRender = vi.fn();
        render(<Checkout onPriceBreakdownRender={onRender} />);

        const rendersAfterMount = onRender.mock.calls.length;

        const giftNote = screen.getByPlaceholderText("Happy birthday!...");
        fireEvent.change(giftNote, { target: { value: "Happy" } });
        fireEvent.change(giftNote, { target: { value: "Happy birthday" } });

        expect(onRender.mock.calls.length).toBe(rendersAfterMount);
    });
});
