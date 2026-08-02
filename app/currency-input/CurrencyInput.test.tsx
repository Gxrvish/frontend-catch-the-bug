// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CurrencyInput } from "./CurrencyInput";

const field = () => screen.getByTestId("amount") as HTMLInputElement;

const type = (input: HTMLInputElement, value: string, caret?: number) =>
    fireEvent.change(input, {
        target:
            caret === undefined
                ? { value }
                : { value, selectionStart: caret, selectionEnd: caret },
    });

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

    it("keeps the caret at the front of the number", () => {
        render(<CurrencyInput />);
        const input = field();

        type(input, "123456");
        expect(input.value).toBe("123,456");

        // The user types a 9 at the very start; regrouping shifts every
        // separator one place right.
        type(input, "9123,456", 1);

        expect(input.value).toBe("9,123,456");
        expect(input.selectionStart).toBe(1);
    });

    it("keeps the caret in place when a digit is deleted", () => {
        render(<CurrencyInput />);
        const input = field();

        type(input, "1234567");
        // Backspace over the "4" of "1,234,567".
        type(input, "1,23,567", 4);

        expect(input.value).toBe("123,567");
        // Three digits precede the caret, so it belongs after the third.
        expect(input.selectionStart).toBe(3);
    });

    it("lets the user type a decimal", () => {
        render(<CurrencyInput />);
        const input = field();

        fireEvent.change(input, { target: { value: "12." } });
        expect(input.value).toBe("12.");

        fireEvent.change(input, { target: { value: "12.50" } });
        expect(input.value).toBe("12.50");
    });

    it("keeps a leading-zero decimal while it is typed", () => {
        render(<CurrencyInput />);
        const input = field();

        type(input, "0.");
        expect(input.value).toBe("0.");

        type(input, "0.05");
        expect(input.value).toBe("0.05");
    });

    it("lets the field be cleared", () => {
        render(<CurrencyInput />);
        const input = field();

        type(input, "1234567");
        type(input, "");

        // A field that refills itself with 0 cannot be emptied.
        expect(input.value).toBe("");
        expect(screen.getByTestId("value")).toHaveTextContent("0");
    });

    it("derives the charged amount from the in-progress text", () => {
        render(<CurrencyInput />);
        const input = field();

        type(input, "12.");
        expect(screen.getByTestId("value")).toHaveTextContent("12");

        type(input, "12.50");
        expect(screen.getByTestId("value")).toHaveTextContent("12.5");
        // …and the text the user is mid-way through typing survives.
        expect(input.value).toBe("12.50");
    });

    it("charges the amount that was typed", () => {
        render(<CurrencyInput />);
        const input = field();

        fireEvent.change(input, { target: { value: "1234.5" } });

        expect(screen.getByTestId("value")).toHaveTextContent("1234.5");
    });
});
