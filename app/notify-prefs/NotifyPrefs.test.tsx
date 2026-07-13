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

    it("saves the webhook URL", () => {
        render(<NotifyPrefs />);

        fireEvent.change(screen.getByTestId("webhook"), {
            target: { value: "https://hooks.example.com/xyz" },
        });
        submit();

        expect(getStored().webhook).toBe("https://hooks.example.com/xyz");
    });
});
