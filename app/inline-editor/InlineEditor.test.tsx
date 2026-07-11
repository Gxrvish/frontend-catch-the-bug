// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetElementTracker, getRegistrationCount } from "./elementTracker";
import { InlineEditor } from "./InlineEditor";

describe("InlineEditor", () => {
    beforeEach(() => {
        _resetElementTracker();
    });

    it("focuses the input when editing starts", () => {
        render(<InlineEditor />);

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));

        expect(screen.getByLabelText("display name")).toHaveFocus();
    });

    it("registers the card with layout telemetry exactly once", () => {
        render(<InlineEditor />);

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        const input = screen.getByLabelText("display name");
        fireEvent.change(input, { target: { value: "Growth OKRs — Q" } });
        fireEvent.change(input, { target: { value: "Growth OKRs — Q4" } });
        fireEvent.change(input, { target: { value: "Growth OKRs — Q4!" } });

        expect(getRegistrationCount()).toBe(1);
    });

    it("edits and saves the document title", () => {
        render(<InlineEditor />);

        expect(screen.getByTestId("display-name")).toHaveTextContent(
            "Growth OKRs — Q3"
        );

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        const input = screen.getByLabelText("display name");
        expect(input).toHaveValue("Growth OKRs — Q3");

        fireEvent.change(input, { target: { value: "Growth OKRs — Q4" } });
        fireEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByTestId("display-name")).toHaveTextContent(
            "Growth OKRs — Q4"
        );
    });
});
