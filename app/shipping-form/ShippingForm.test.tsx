// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShippingForm } from "./ShippingForm";

const settle = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
    });
};

describe("ShippingForm", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("keeps the name input controlled from first render (no React warning)", async () => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        render(<ShippingForm />);
        await settle();
        fireEvent.change(screen.getByLabelText("recipient name"), {
            target: { value: "Ada M." },
        });

        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("toggles express shipping on click", async () => {
        render(<ShippingForm />);
        await settle();

        const express = screen.getByLabelText("express shipping");
        fireEvent.click(express);

        expect(express).toBeChecked();
    });

    it("survives clearing the quantity field", async () => {
        render(<ShippingForm />);
        await settle();

        const quantity = screen.getByLabelText("quantity");
        fireEvent.change(quantity, { target: { value: "" } });
        expect(quantity).not.toHaveValue("NaN");

        fireEvent.change(quantity, { target: { value: "3" } });
        expect(quantity).toHaveValue("3");
    });

    it("clears the quantity to an empty field, not a stand-in number", async () => {
        render(<ShippingForm />);
        await settle();

        const quantity = screen.getByLabelText("quantity");
        fireEvent.change(quantity, { target: { value: "12" } });
        expect(quantity).toHaveValue("12");

        fireEvent.change(quantity, { target: { value: "" } });

        // Coercing the empty field to 0 also avoids "NaN" — and stops the
        // user from deleting what they typed.
        expect(quantity).toHaveValue("");

        fireEvent.change(quantity, { target: { value: "7" } });
        expect(quantity).toHaveValue("7");
    });

    it("toggles express shipping back off again", async () => {
        render(<ShippingForm />);
        await settle();

        const express = screen.getByLabelText("express shipping");
        fireEvent.click(express);
        expect(express).toBeChecked();

        fireEvent.click(express);
        expect(express).not.toBeChecked();
    });

    it("stays warning-free across every field", async () => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        render(<ShippingForm />);
        await settle();

        fireEvent.change(screen.getByLabelText("recipient name"), {
            target: { value: "Ada M." },
        });
        fireEvent.click(screen.getByLabelText("express shipping"));
        fireEvent.change(screen.getByLabelText("quantity"), {
            target: { value: "" },
        });
        fireEvent.change(screen.getByLabelText("quantity"), {
            target: { value: "2" },
        });

        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("loads the draft into all three fields and allows editing", async () => {
        render(<ShippingForm />);

        expect(
            await screen.findByDisplayValue("Ada Moreno")
        ).toBeInTheDocument();
        expect(screen.getByLabelText("express shipping")).not.toBeChecked();
        expect(screen.getByLabelText("quantity")).toHaveValue("1");

        fireEvent.change(screen.getByLabelText("recipient name"), {
            target: { value: "Ada Moreno-Diaz" },
        });
        expect(screen.getByDisplayValue("Ada Moreno-Diaz")).toBeInTheDocument();
    });
});
