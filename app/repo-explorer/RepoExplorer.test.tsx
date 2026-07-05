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
