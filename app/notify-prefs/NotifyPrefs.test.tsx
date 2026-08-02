// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { NotifyPrefs } from "./NotifyPrefs";
import { _resetPrefsApi, getStored } from "./prefsApi";

const submit = () =>
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

describe("NotifyPrefs", () => {
    beforeEach(() => {
        _resetPrefsApi();
    });

    it("keeps the plan when saving", () => {
        render(<NotifyPrefs />);

        submit();

        // The endpoint replaces the whole record — the payload must carry
        // the plan, or saving preferences silently wipes it.
        expect(getStored().plan).toBe("pro");
    });

    it("can turn email alerts off", () => {
        render(<NotifyPrefs />);

        fireEvent.click(screen.getByTestId("email-alerts"));
        submit();

        expect(getStored().emailAlerts).toBe(false);
    });

    it("computes the follow-up hour as a number", () => {
        render(<NotifyPrefs />);

        fireEvent.change(screen.getByTestId("digest-hour"), {
            target: { value: "9" },
        });
        submit();

        expect(screen.getByTestId("confirmation")).toHaveTextContent(
            "Follow-up summary at 10:00."
        );
    });

    it("stores email alerts as a boolean when left on", () => {
        render(<NotifyPrefs />);

        submit();

        // "on" is what the form sends; it is not what the record holds.
        expect(getStored().emailAlerts).toBe(true);
    });

    it("stores the digest hour as a number", () => {
        render(<NotifyPrefs />);

        submit();

        expect(getStored().digestHour).toBe(8);
        expect(screen.getByTestId("confirmation")).toHaveTextContent(
            "Follow-up summary at 9:00."
        );
    });

    it("keeps the plan field locked while still submitting it", () => {
        render(<NotifyPrefs />);
        const plan = screen.getByTestId("plan") as HTMLInputElement;

        submit();

        expect(getStored().plan).toBe("pro");
        // Unlocking the field would carry the value — and hand the user a
        // billing control the page is not allowed to offer.
        expect(plan.readOnly || plan.disabled).toBe(true);
    });

    it("saves every field in one go with the right types", () => {
        render(<NotifyPrefs />);

        fireEvent.change(screen.getByTestId("webhook"), {
            target: { value: "https://hooks.example.com/all" },
        });
        fireEvent.click(screen.getByTestId("email-alerts"));
        fireEvent.change(screen.getByTestId("digest-hour"), {
            target: { value: "9" },
        });
        submit();

        expect(getStored()).toEqual({
            webhook: "https://hooks.example.com/all",
            emailAlerts: false,
            digestHour: 9,
            plan: "pro",
        });
    });

    it("saves the webhook URL", () => {
        render(<NotifyPrefs />);

        fireEvent.change(screen.getByTestId("webhook"), {
            target: { value: "https://hooks.example.com/xyz" },
        });
        submit();

        expect(getStored().webhook).toBe("https://hooks.example.com/xyz");
    });
});
