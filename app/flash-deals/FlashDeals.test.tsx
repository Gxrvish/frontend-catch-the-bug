// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FlashDeals } from "./FlashDeals";
import { DISMISS_KEY } from "./flashDealsData";

// Hydration roots are torn down here, not at the end of each test — a
// failing assertion must not leave a second copy of the page in the DOM.
const mounted: Array<() => void> = [];

/** Server render, a beat of wall-clock drift, then hydrate and listen. */
const hydrateAfterDrift = async ({ dismissBetween = false } = {}) => {
    const serverHtml = renderToString(<FlashDeals />);

    // The server had no idea about this device; the browser does.
    if (dismissBetween) window.localStorage.setItem(DISMISS_KEY, "1");
    await new Promise((resolve) => setTimeout(resolve, 20));

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    const recoverableErrors: unknown[] = [];
    const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

    let root!: ReturnType<typeof hydrateRoot>;
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

    mounted.push(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    return { serverHtml, container, recoverableErrors, hydrationComplaints };
};

describe("FlashDeals", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        mounted.splice(0).forEach((teardown) => teardown());
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

    it("hydrates cleanly when the bar has not been dismissed", async () => {
        const { recoverableErrors, hydrationComplaints } =
            await hydrateAfterDrift();

        // The clock alone breaks the contract — dismissal is only half
        // of this ticket.
        expect(recoverableErrors).toHaveLength(0);
        expect(hydrationComplaints).toHaveLength(0);
    });

    it("still server-renders the deals themselves", async () => {
        const {
            serverHtml,
            container,
            recoverableErrors,
            hydrationComplaints,
        } = await hydrateAfterDrift();

        // Rendering nothing until mounted also hydrates cleanly — and
        // gives up server rendering entirely.
        expect(serverHtml).toContain("Wireless Earbuds");
        expect(serverHtml).toContain("USB-C Hub");
        expect(
            container.querySelector('[data-testid="deal-countdown"]')
                ?.textContent
        ).toMatch(/\d{2}:\d{2}:\d{2}/);
        expect(recoverableErrors).toHaveLength(0);
        expect(hydrationComplaints).toHaveLength(0);
    });

    it("settles into the dismissed state after hydration", async () => {
        const { container, recoverableErrors, hydrationComplaints } =
            await hydrateAfterDrift({ dismissBetween: true });

        // Clean hydration is not permission to ignore the device's
        // earlier choice — the second pass has to land.
        expect(container.textContent).toContain(
            "Deals bar dismissed on this device."
        );
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
