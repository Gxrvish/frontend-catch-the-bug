// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FlashDeals } from "./FlashDeals";
import { DISMISS_KEY } from "./flashDealsData";

describe("FlashDeals", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("hydrates cleanly against the server-rendered HTML", async () => {
        // The server renders with no localStorage and its own clock…
        const serverHtml = renderToString(<FlashDeals />);

        // …then the request reaches a device where the bar was dismissed
        // earlier, a few milliseconds later.
        window.localStorage.setItem(DISMISS_KEY, "1");
        await new Promise((resolve) => setTimeout(resolve, 20));

        const container = document.createElement("div");
        container.innerHTML = serverHtml;
        document.body.appendChild(container);

        const recoverableErrors: unknown[] = [];
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        let root: ReturnType<typeof hydrateRoot>;
        await act(async () => {
            root = hydrateRoot(container, <FlashDeals />, {
                onRecoverableError: (error) => {
                    recoverableErrors.push(error);
                },
            });
        });

        const hydrationComplaints = consoleError.mock.calls.filter((call) =>
            String(call[0]).toLowerCase().includes("hydrat")
        );
        consoleError.mockRestore();

        act(() => {
            root.unmount();
        });
        container.remove();

        // Hydration must adopt the server HTML without throwing any of it
        // away: no recoverable hydration errors, no mismatch warnings.
        expect(recoverableErrors).toHaveLength(0);
        expect(hydrationComplaints).toHaveLength(0);
    });

    it("shows the countdown after mount and persists dismissal", () => {
        render(<FlashDeals />);

        // Once mounted on the client, the timer is live…
        expect(screen.getByTestId("deal-countdown")).toHaveTextContent(
            /\d{2}:\d{2}:\d{2}/
        );
        expect(screen.getByText("Wireless Earbuds")).toBeInTheDocument();

        // …and dismissing hides the bar and remembers the choice.
        fireEvent.click(screen.getByLabelText("dismiss deals"));
        expect(
            screen.getByText("Deals bar dismissed on this device.")
        ).toBeInTheDocument();
        expect(window.localStorage.getItem(DISMISS_KEY)).toBe("1");
    });
});
