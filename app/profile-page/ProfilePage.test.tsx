// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Anything pooled outside React lives as long as the module does, so
// every test starts from a cold module graph — including the counter,
// which has to come from that same graph.
let ProfilePage: typeof import("./ProfilePage").ProfilePage;
let getCallCount: typeof import("./userApi").getCallCount;

describe("ProfilePage", () => {
    beforeEach(async () => {
        vi.resetModules();
        ({ ProfilePage } = await import("./ProfilePage"));
        const api = await import("./userApi");
        getCallCount = api.getCallCount;
        api._resetUserApi();
    });

    it("loads the user exactly once for the whole page", async () => {
        render(<ProfilePage />);

        const header = within(screen.getByTestId("profile-header"));
        const sidebar = within(screen.getByTestId("plan-sidebar"));
        const billing = within(screen.getByTestId("billing-panel"));

        expect(await header.findByText("Ada Moreno")).toBeInTheDocument();
        expect(await sidebar.findByText("Pro (annual)")).toBeInTheDocument();
        expect(
            await billing.findByText("Card ending in 4242")
        ).toBeInTheDocument();

        expect(getCallCount()).toBe(1);
    });

    it("still loads once under StrictMode's double mount", async () => {
        render(
            <StrictMode>
                <ProfilePage />
            </StrictMode>
        );

        expect(
            await within(screen.getByTestId("profile-header")).findByText(
                "Ada Moreno"
            )
        ).toBeInTheDocument();
        expect(
            await within(screen.getByTestId("billing-panel")).findByText(
                "Card ending in 4242"
            )
        ).toBeInTheDocument();

        // Dev-mode remounting is exactly the storm this dedupe exists for.
        expect(getCallCount()).toBe(1);
    });

    it("shares the load between widgets that mount together", async () => {
        render(<ProfilePage />);

        // Before anything resolves, all three widgets are already waiting
        // on the same request.
        expect(getCallCount()).toBe(1);

        expect(
            await within(screen.getByTestId("plan-sidebar")).findByText(
                "Pro (annual)"
            )
        ).toBeInTheDocument();
        expect(getCallCount()).toBe(1);
    });

    it("renders user data in all three widgets", async () => {
        render(<ProfilePage />);

        const header = within(screen.getByTestId("profile-header"));
        const sidebar = within(screen.getByTestId("plan-sidebar"));
        const billing = within(screen.getByTestId("billing-panel"));

        expect(await header.findByText("Ada Moreno")).toBeInTheDocument();
        expect(header.getByText("ada@example.com")).toBeInTheDocument();
        expect(await sidebar.findByText("Pro (annual)")).toBeInTheDocument();
        expect(
            await billing.findByText("Card ending in 4242")
        ).toBeInTheDocument();
    });
});
