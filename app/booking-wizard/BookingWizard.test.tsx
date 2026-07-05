// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BookingWizard } from "./BookingWizard";

describe("BookingWizard", () => {
    it("keeps focus and captures every character while typing the guest name", async () => {
        const user = userEvent.setup();
        render(<BookingWizard />);

        const nameInput = screen.getByLabelText("guest name");
        await user.type(nameInput, "Jane Doe");

        // Every keystroke must land in the field the user is typing into…
        expect(screen.getByLabelText("guest name")).toHaveValue("Jane Doe");
        // …and the field must still own the keyboard focus afterwards.
        expect(document.activeElement).toBe(
            screen.getByLabelText("guest name")
        );
    });

    it("carries entered details through to the review step", () => {
        render(<BookingWizard />);

        fireEvent.change(screen.getByLabelText("guest name"), {
            target: { value: "Ada Lovelace" },
        });
        fireEvent.change(screen.getByLabelText("guest email"), {
            target: { value: "ada@example.com" },
        });

        fireEvent.click(screen.getByText("Next")); // → stay dates
        fireEvent.click(screen.getByText("Next")); // → review

        expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
        expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();
    });
});
