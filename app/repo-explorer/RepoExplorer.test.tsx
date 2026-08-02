// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RepoExplorer } from "./RepoExplorer";

const renderExplorer = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <RepoExplorer />
        </QueryClientProvider>
    );
};

describe("RepoExplorer", () => {
    it("shows the selected user's repos after switching profiles", async () => {
        renderExplorer();

        // Initial profile (@nova-dev) loads its own repos.
        expect(await screen.findByText("nova-cli")).toBeInTheDocument();

        // Switch to @quantum-cat.
        fireEvent.click(screen.getByText("@quantum-cat"));

        // The list must end up showing quantum-cat's repos…
        await waitFor(() => {
            expect(screen.getByText("qsim")).toBeInTheDocument();
        });
        // …and none of nova-dev's may remain under the new header.
        expect(screen.getByTestId("profile-header")).toHaveTextContent(
            "@quantum-cat"
        );
        expect(screen.queryByText("nova-cli")).not.toBeInTheDocument();
    });

    it("shows each profile's repos when cycling through all three", async () => {
        renderExplorer();
        expect(await screen.findByText("nova-cli")).toBeInTheDocument();

        fireEvent.click(screen.getByText("@pixel-forge"));
        expect(await screen.findByText("shader-lab")).toBeInTheDocument();
        expect(screen.queryByText("nova-cli")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("@quantum-cat"));
        expect(await screen.findByText("qsim")).toBeInTheDocument();
        expect(screen.queryByText("shader-lab")).not.toBeInTheDocument();
    });

    it("serves a profile it has already loaded from cache", async () => {
        renderExplorer();
        expect(await screen.findByText("nova-cli")).toBeInTheDocument();

        fireEvent.click(screen.getByText("@quantum-cat"));
        expect(await screen.findByText("qsim")).toBeInTheDocument();

        fireEvent.click(screen.getByText("@nova-dev"));

        // Coming back is a cache hit, not a fresh load — clearing the
        // cache or refetching on click would show the spinner again.
        expect(screen.queryByText("Loading repos…")).not.toBeInTheDocument();
        expect(screen.getByText("nova-cli")).toBeInTheDocument();
        expect(screen.getByTestId("profile-header")).toHaveTextContent(
            "@nova-dev"
        );
    });

    it("loads the initial profile's repos", async () => {
        renderExplorer();

        expect(screen.getByText("Loading repos…")).toBeInTheDocument();

        expect(await screen.findByText("nova-cli")).toBeInTheDocument();
        expect(await screen.findByText("hyperfetch")).toBeInTheDocument();
        expect(screen.getByTestId("profile-header")).toHaveTextContent(
            "@nova-dev"
        );
    });
});
