// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetPriceFeed, getConnectCount } from "./priceFeed";
import { StockAlerts } from "./StockAlerts";

const waitMs = async (ms: number) => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, ms));
    });
};

describe("StockAlerts", () => {
    beforeEach(() => {
        _resetPriceFeed();
    });

    it("does not reconnect the feed while typing in the filter", async () => {
        render(<StockAlerts />);
        await waitMs(150);

        const before = getConnectCount();
        const filter = screen.getByLabelText("filter symbols");
        fireEvent.change(filter, { target: { value: "A" } });
        fireEvent.change(filter, { target: { value: "AA" } });
        fireEvent.change(filter, { target: { value: "AAP" } });

        expect(getConnectCount()).toBe(before);
    });

    it("keeps a single connection while alerts arrive", async () => {
        render(<StockAlerts />);
        await waitMs(150);

        expect(screen.getAllByTestId("alert-row").length).toBeGreaterThan(0);
        expect(getConnectCount()).toBe(1);
    });

    it("shows tick prices and filters the watchlist", async () => {
        render(<StockAlerts />);
        await waitMs(150);

        expect(screen.getByText(/187.2/)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("filter symbols"), {
            target: { value: "MS" },
        });
        const rows = screen.getAllByTestId("watch-row");
        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveTextContent("MSFT");
    });
});
