// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetWaitlist, entryCount } from "./waitlistApi";
import { WaitlistSignup } from "./WaitlistSignup";

const flushPendingSubmits = () =>
    act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
    });

describe("WaitlistSignup", () => {
    beforeEach(() => {
        _resetWaitlist();
    });

    it("records a single signup even when submit is double-clicked", async () => {
        const user = userEvent.setup();
        render(<WaitlistSignup />);

        await user.type(
            screen.getByLabelText("email address"),
            "ada@example.com"
        );

        const button = screen.getByRole("button", { name: /join waitlist/i });
        // Impatient double-click — the second click must not queue a second
        // signup.
        await user.click(button);
        await user.click(button);

        expect(await screen.findByTestId("confirmation")).toBeInTheDocument();
        await flushPendingSubmits();

        expect(entryCount("ada@example.com")).toBe(1);
    });

    it("signs up and confirms a spot on a single submit", async () => {
        const user = userEvent.setup();
        render(<WaitlistSignup />);

        await user.type(
            screen.getByLabelText("email address"),
            "grace@example.com"
        );
        await user.click(
            screen.getByRole("button", { name: /join waitlist/i })
        );

        expect(await screen.findByTestId("confirmation")).toBeInTheDocument();
        await flushPendingSubmits();

        expect(entryCount("grace@example.com")).toBe(1);
        expect(screen.queryByTestId("signup-error")).not.toBeInTheDocument();
    });
});
