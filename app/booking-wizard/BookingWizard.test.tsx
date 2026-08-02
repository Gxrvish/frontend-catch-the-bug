// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BookingWizard } from "./BookingWizard";

const next = () => fireEvent.click(screen.getByText("Next"));
const back = () => fireEvent.click(screen.getByText("Back"));

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

    it("keeps the very same input element across a keystroke", () => {
        render(<BookingWizard />);

        const before = screen.getByLabelText("guest name");
        before.focus();
        fireEvent.change(before, { target: { value: "J" } });

        // Putting focus back by hand after a remount is not a fix: the
        // node itself has to survive, or selection, IME composition and
        // scroll position go with it.
        expect(screen.getByLabelText("guest name")).toBe(before);
        expect(document.activeElement).toBe(before);
        expect(before).toHaveValue("J");
    });

    it("keeps the stay-date fields alive while they are edited", () => {
        render(<BookingWizard />);
        next();

        const checkIn = screen.getByLabelText("check-in date");
        checkIn.focus();
        fireEvent.change(checkIn, { target: { value: "2026-09-01" } });

        // The other steps are built the same way — repairing only the one
        // the ticket names leaves the rest broken.
        expect(screen.getByLabelText("check-in date")).toBe(checkIn);
        expect(document.activeElement).toBe(checkIn);
        expect(checkIn).toHaveValue("2026-09-01");
    });

    it("keeps the guest-count select alive while it is changed", () => {
        render(<BookingWizard />);

        const guests = screen.getByLabelText("guest count");
        guests.focus();
        fireEvent.change(guests, { target: { value: "4" } });

        expect(screen.getByLabelText("guest count")).toBe(guests);
        expect(document.activeElement).toBe(guests);

        next();
        next();
        expect(screen.getByText(/4 guests/)).toBeInTheDocument();
    });

    it("still holds the field steady after stepping forward and back", () => {
        render(<BookingWizard />);

        fireEvent.change(screen.getByLabelText("guest name"), {
            target: { value: "Ada" },
        });
        next();
        back();

        const returned = screen.getByLabelText("guest name");
        expect(returned).toHaveValue("Ada");

        returned.focus();
        fireEvent.change(returned, { target: { value: "Ada L" } });

        expect(screen.getByLabelText("guest name")).toBe(returned);
        expect(document.activeElement).toBe(returned);
    });

    it("does not tear down the review step when the booking is confirmed", async () => {
        render(<BookingWizard />);

        fireEvent.change(screen.getByLabelText("guest name"), {
            target: { value: "Ada Lovelace" },
        });
        next();
        next();

        const guestLine = screen.getByText(/Ada Lovelace/);
        fireEvent.click(screen.getByText("Confirm booking"));

        expect(await screen.findByTestId("confirmation")).toBeInTheDocument();
        // Arriving state re-renders the step; it must not rebuild it.
        expect(screen.getByText(/Ada Lovelace/)).toBe(guestLine);
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
