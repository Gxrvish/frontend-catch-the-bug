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

    it("makes the submit button inert while a signup is pending", async () => {
        const user = userEvent.setup();
        render(<WaitlistSignup />);

        await user.type(
            screen.getByLabelText("email address"),
            "ada@example.com"
        );

        const button = screen.getByRole("button", { name: /join waitlist/i });
        await user.click(button);

        // Mid-flight the control has to say so, not just swallow the
        // second click after the fact.
        expect(button).toBeDisabled();

        await flushPendingSubmits();
        expect(button).toBeEnabled();
        expect(entryCount("ada@example.com")).toBe(1);
    });

    it("survives a burst of clicks and still lets a second person sign up", async () => {
        const user = userEvent.setup();
        render(<WaitlistSignup />);

        const email = screen.getByLabelText("email address");
        const button = screen.getByRole("button", { name: /join waitlist/i });

        await user.type(email, "ada@example.com");
        await user.click(button);
        await user.click(button);
        await user.click(button);
        await flushPendingSubmits();

        expect(entryCount("ada@example.com")).toBe(1);
        expect(screen.queryByTestId("signup-error")).not.toBeInTheDocument();

        // The guard is per submit, not a one-shot latch on the form.
        await user.clear(email);
        await user.type(email, "grace@example.com");
        await user.click(button);
        await flushPendingSubmits();

        expect(entryCount("grace@example.com")).toBe(1);
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
