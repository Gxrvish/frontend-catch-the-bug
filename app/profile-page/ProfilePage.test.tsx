// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ProfilePage } from "./ProfilePage";
import { _resetUserApi, getCallCount } from "./userApi";

describe("ProfilePage", () => {
    beforeEach(() => {
        _resetUserApi();
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
