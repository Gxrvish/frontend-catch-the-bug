// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
    _resetElementTracker,
    getActiveTrackerCount,
    getRegistrationCount,
} from "./elementTracker";
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

    it("focuses the input every time editing starts", () => {
        render(<InlineEditor />);

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        expect(screen.getByLabelText("display name")).toHaveFocus();

        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        fireEvent.click(screen.getByRole("button", { name: "Edit" }));

        // Focusing once on mount is not the same as focusing when
        // editing starts.
        expect(screen.getByLabelText("display name")).toHaveFocus();
    });

    it("keeps one registration across edit-mode toggles", () => {
        render(<InlineEditor />);

        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        fireEvent.change(screen.getByLabelText("display name"), {
            target: { value: "Growth OKRs — Q4" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        fireEvent.click(screen.getByRole("button", { name: "Edit" }));
        fireEvent.change(screen.getByLabelText("display name"), {
            target: { value: "Growth OKRs — Q4!" },
        });

        // The card root never unmounts, so it never re-registers.
        expect(getRegistrationCount()).toBe(1);
        expect(getActiveTrackerCount()).toBe(1);
    });

    it("untracks the card when it unmounts", () => {
        const { unmount } = render(<InlineEditor />);
        expect(getActiveTrackerCount()).toBe(1);

        unmount();

        // A registration that outlives the panel holds an observer slot
        // for a node that no longer exists.
        expect(getActiveTrackerCount()).toBe(0);
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
