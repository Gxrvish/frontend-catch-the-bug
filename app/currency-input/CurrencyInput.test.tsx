// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const field = () => screen.getByTestId("amount") as HTMLInputElement;

import { CurrencyInput } from "./CurrencyInput";

describe("CurrencyInput", () => {
    it("keeps the caret where the user was typing", () => {
        render(<CurrencyInput />);
        const input = field();

        fireEvent.change(input, { target: { value: "1234567" } });
        expect(input.value).toBe("1,234,567");

        // Caret sits after "1,2"; the user types a 9 there.
        fireEvent.change(input, {
            target: {
                value: "1,2934,567",
                selectionStart: 4,
                selectionEnd: 4,
            },
        });

        expect(input.value).toBe("12,934,567");
        // The caret must stay just after the digit that was typed, not get
        // flung to the end of the re-formatted text.
        expect(input.selectionStart).toBe(4);
    });

    it("lets the user type a decimal", () => {
        render(<CurrencyInput />);
        const input = field();

        fireEvent.change(input, { target: { value: "12." } });
        expect(input.value).toBe("12.");

        fireEvent.change(input, { target: { value: "12.50" } });
        expect(input.value).toBe("12.50");
    });

    it("charges the amount that was typed", () => {
        render(<CurrencyInput />);
        const input = field();

        fireEvent.change(input, { target: { value: "1234.5" } });

        expect(screen.getByTestId("value")).toHaveTextContent("1234.5");
    });
});
