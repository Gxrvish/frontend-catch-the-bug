// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MailComposer } from "./MailComposer";

describe("MailComposer", () => {
    it("starts a fresh draft when switching to another conversation", () => {
        render(<MailComposer />);

        fireEvent.change(screen.getByLabelText("message body"), {
            target: { value: "Sounds good, Priya — I'll add two items." },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /Design tokens migration/ })
        );

        expect(screen.getByTestId("composer-subject")).toHaveTextContent(
            "Re: Design tokens migration"
        );
        expect(screen.getByLabelText("message body")).toHaveValue("");
    });

    it("starts forward mode from the quoted original, not the reply draft", () => {
        render(<MailComposer />);

        fireEvent.change(screen.getByLabelText("message body"), {
            target: { value: "Sounds good, see you Thursday." },
        });

        fireEvent.click(screen.getByRole("button", { name: "forward" }));

        const body = screen.getByLabelText("message body");
        expect(body).toHaveValue(
            "\n\n---------- Forwarded message ----------\nFrom: Priya Nair\n\nDraft agenda attached — please add your items before Thursday."
        );
    });

    it("starts fresh again when returning to a conversation", () => {
        render(<MailComposer />);
        const body = () => screen.getByLabelText("message body");

        fireEvent.change(body(), { target: { value: "Draft for Priya" } });
        fireEvent.click(
            screen.getByRole("button", { name: /Design tokens migration/ })
        );
        fireEvent.change(body(), { target: { value: "Draft for Jonas" } });

        fireEvent.click(
            screen.getByRole("button", { name: /Quarterly roadmap review/ })
        );

        // Coming back is a new draft too, not the one abandoned earlier.
        expect(body()).toHaveValue("");
    });

    it("resets the body on a mode switch in both directions", () => {
        render(<MailComposer />);
        const body = () => screen.getByLabelText("message body");

        fireEvent.click(screen.getByRole("button", { name: "forward" }));
        fireEvent.change(body(), { target: { value: "FYI — see below." } });

        fireEvent.click(screen.getByRole("button", { name: "reply" }));
        expect(body()).toHaveValue("");
        expect(screen.getByTestId("composer-subject")).toHaveTextContent(
            "Re: Quarterly roadmap review"
        );

        // …and forward starts from the quote again, not the reply draft.
        fireEvent.change(body(), { target: { value: "Thanks!" } });
        fireEvent.click(screen.getByRole("button", { name: "forward" }));
        expect(body()).toHaveValue(
            "\n\n---------- Forwarded message ----------\nFrom: Priya Nair\n\nDraft agenda attached — please add your items before Thursday."
        );
    });

    it("quotes the conversation that is actually selected", () => {
        render(<MailComposer />);

        fireEvent.click(
            screen.getByRole("button", { name: /On-call handover notes/ })
        );
        fireEvent.click(screen.getByRole("button", { name: "forward" }));

        expect(screen.getByLabelText("message body")).toHaveValue(
            "\n\n---------- Forwarded message ----------\nFrom: Sofia Reyes\n\nTwo open incidents, both low severity. Runbook links inside."
        );
        expect(screen.getByTestId("composer-subject")).toHaveTextContent(
            "Fwd: On-call handover notes"
        );
    });

    it("lists all conversations and shows the selected subject", () => {
        render(<MailComposer />);

        expect(
            screen.getByRole("button", { name: /Quarterly roadmap review/ })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Design tokens migration/ })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /On-call handover notes/ })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Team offsite logistics/ })
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: /On-call handover notes/ })
        );
        expect(screen.getByTestId("composer-subject")).toHaveTextContent(
            "Re: On-call handover notes"
        );
    });
});
