// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkout } from "./Checkout";

const applyCoupon = (code: string) => {
    fireEvent.change(screen.getByPlaceholderText("SAVE10"), {
        target: { value: code },
    });
    fireEvent.click(screen.getByText("Apply"));
};

const total = () => screen.getByTestId("total-amount");

describe("Checkout", () => {
    it("updates the total immediately when a coupon is applied", () => {
        render(<Checkout />);

        // Seed cart: $100 + 2 × $50 = $200 subtotal + $5 standard shipping.
        expect(total()).toHaveTextContent("$205.00");

        applyCoupon("SAVE10");

        // 10% off the $200 subtotal = $20 discount.
        expect(total()).toHaveTextContent("$185.00");
    });

    it("applies a coupon that lands after a quantity change", () => {
        render(<Checkout />);

        fireEvent.change(
            screen.getByLabelText("Mechanical Keyboard quantity"),
            {
                target: { value: "3" },
            }
        );
        expect(total()).toHaveTextContent("$405.00");

        applyCoupon("SAVE25");

        // 25% off the $400 subtotal = $100 discount, + $5 shipping.
        expect(total()).toHaveTextContent("$305.00");
    });

    it("keeps the coupon applied when shipping changes afterwards", () => {
        render(<Checkout />);

        applyCoupon("SAVE10");
        expect(total()).toHaveTextContent("$185.00");

        fireEvent.click(screen.getByText("Express $15"));

        // $200 − $20 + $15. The discount must already have been there.
        expect(total()).toHaveTextContent("$195.00");
    });

    it("ignores an unknown coupon and still applies a valid one after it", () => {
        render(<Checkout />);

        applyCoupon("NOPE99");
        expect(total()).toHaveTextContent("$205.00");
        expect(screen.queryByText(/applied\./)).not.toBeInTheDocument();

        applyCoupon("SAVE25");
        expect(total()).toHaveTextContent("$155.00");
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

    it("still re-renders the Order Summary when pricing changes", () => {
        const onRender = vi.fn();
        render(<Checkout onPriceBreakdownRender={onRender} />);

        const quiet = onRender.mock.calls.length;
        fireEvent.change(screen.getByPlaceholderText("Happy birthday!..."), {
            target: { value: "Enjoy" },
        });
        expect(onRender.mock.calls.length).toBe(quiet);

        // Dropping the probe would satisfy the line above too — the
        // summary still has to wake up for its own inputs.
        fireEvent.click(screen.getByText("Express $15"));
        expect(onRender.mock.calls.length).toBeGreaterThan(quiet);
        expect(total()).toHaveTextContent("$215.00");
    });

    it("keeps the gift note in cart state and still shields the summary later", () => {
        const onRender = vi.fn();
        render(<Checkout onPriceBreakdownRender={onRender} />);

        const giftNote = screen.getByPlaceholderText("Happy birthday!...");
        fireEvent.change(giftNote, { target: { value: "Enjoy" } });

        fireEvent.click(screen.getByText("Express $15"));
        applyCoupon("SAVE10");

        // Pricing churn must not drop the note — it is shared cart state,
        // not scratch state inside the input.
        expect(giftNote).toHaveValue("Enjoy");
        expect(total()).toHaveTextContent("$195.00");

        // And the shield has to hold after the cart has moved on, not
        // only for the value the provider first rendered with.
        const settled = onRender.mock.calls.length;
        fireEvent.change(giftNote, { target: { value: "Enjoy it" } });
        expect(onRender.mock.calls.length).toBe(settled);
    });
});
