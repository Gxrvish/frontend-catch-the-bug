// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { CatalogFilters } from "./CatalogFilters";

describe("CatalogFilters", () => {
    beforeEach(() => {
        // location/history persist across tests inside one jsdom file.
        window.history.replaceState(null, "", "/");
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
