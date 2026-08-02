// @vitest-environment jsdom
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogFilters } from "./CatalogFilters";

describe("CatalogFilters", () => {
    beforeEach(() => {
        // location/history persist across tests inside one jsdom file.
        window.history.replaceState(null, "", "/");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("restores the previous filter when the user presses Back", async () => {
        render(<CatalogFilters />);

        fireEvent.click(screen.getByTestId("brand-Nike"));
        fireEvent.click(screen.getByTestId("brand-Adidas"));
        expect(screen.getByTestId("active-brand")).toHaveTextContent("Adidas");

        window.history.back();

        await waitFor(() =>
            expect(screen.getByTestId("active-brand")).toHaveTextContent("Nike")
        );
    });

    it("subscribes to popstate once and unsubscribes on unmount", () => {
        const add = vi.spyOn(window, "addEventListener");
        const remove = vi.spyOn(window, "removeEventListener");
        const countPopstate = (spy: typeof add) =>
            spy.mock.calls.filter((call) => call[0] === "popstate").length;

        render(<CatalogFilters />);

        // Re-render a few times — the subscription must not accumulate.
        fireEvent.click(screen.getByTestId("brand-Nike"));
        fireEvent.click(screen.getByTestId("brand-Adidas"));
        fireEvent.change(screen.getByTestId("search"), {
            target: { value: "run" },
        });

        expect(countPopstate(add)).toBe(1);

        cleanup();

        // A listener that outlives the component keeps answering history
        // events against an unmounted tree.
        expect(countPopstate(remove)).toBe(1);
    });

    it("restores the initial filter when Back reaches the first entry", async () => {
        render(<CatalogFilters />);

        fireEvent.click(screen.getByTestId("brand-Nike"));

        window.history.back();

        // The entry the page loaded with has a null history state — it is
        // still a place the user can go back to.
        await waitFor(() =>
            expect(screen.getByTestId("active-brand")).toHaveTextContent("All")
        );
        expect(screen.getAllByTestId("product")).toHaveLength(6);
    });

    it("restores both brand and search text when the user presses Back", async () => {
        render(<CatalogFilters />);

        fireEvent.click(screen.getByTestId("brand-Nike"));
        fireEvent.change(screen.getByTestId("search"), {
            target: { value: "air" },
        });
        fireEvent.click(screen.getByTestId("brand-Adidas"));

        window.history.back();

        await waitFor(() =>
            expect(screen.getByTestId("active-brand")).toHaveTextContent("Nike")
        );
        // The restored entry carried a search term too.
        expect(screen.getByTestId("search")).toHaveValue("air");
    });

    it("restores a brand that needs encoding when the user presses Back", async () => {
        render(<CatalogFilters />);

        fireEvent.click(screen.getByTestId("brand-Fog & Mist"));
        fireEvent.click(screen.getByTestId("brand-Nike"));

        window.history.back();

        await waitFor(() =>
            expect(screen.getByTestId("active-brand")).toHaveTextContent(
                "Fog & Mist"
            )
        );
    });

    it("does not grow history on every search keystroke", () => {
        render(<CatalogFilters />);
        const input = screen.getByTestId("search");
        const before = window.history.length;

        for (const text of ["r", "ru", "run", "runn", "runne", "runner"]) {
            fireEvent.change(input, { target: { value: text } });
        }

        // Transient state may claim at most one history entry — Back must
        // not walk through every keystroke.
        expect(window.history.length - before).toBeLessThanOrEqual(1);
    });

    it("round-trips a brand that needs encoding", () => {
        render(<CatalogFilters />);

        fireEvent.click(screen.getByTestId("brand-Fog & Mist"));

        const params = new URLSearchParams(window.location.search);
        expect(params.get("brand")).toBe("Fog & Mist");
    });

    it("filters the list and updates the URL for a simple brand", () => {
        render(<CatalogFilters />);

        fireEvent.click(screen.getByTestId("brand-Nike"));

        expect(window.location.search).toContain("brand=Nike");
        const products = screen.getAllByTestId("product");
        expect(products).toHaveLength(2);
        expect(products[0]).toHaveTextContent("Air Runner");
    });
});
