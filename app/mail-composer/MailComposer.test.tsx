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
