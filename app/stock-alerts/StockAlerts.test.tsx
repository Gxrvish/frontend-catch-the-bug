// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { FeedPanel } from "./FeedPanel";
import {
    _resetPriceFeed,
    getConnectCount,
    getDisconnectCount,
} from "./priceFeed";
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

    it("keeps alerts flowing while filtering, with no churn", async () => {
        render(<StockAlerts />);
        await waitMs(150);
        const early = screen.getAllByTestId("alert-row").length;

        fireEvent.change(screen.getByLabelText("filter symbols"), {
            target: { value: "MS" },
        });
        await waitMs(250);

        // A reconnect would also keep the ticks coming — by restarting
        // the script and paying for another connection.
        expect(getConnectCount()).toBe(1);
        expect(getDisconnectCount()).toBe(0);
        expect(screen.getAllByTestId("alert-row").length).toBeGreaterThan(
            early - 1
        );
    });

    it("still reconnects when the watched symbols really change", async () => {
        const view = render(<StockAlerts />);
        await waitMs(150);

        fireEvent.change(screen.getByLabelText("filter symbols"), {
            target: { value: "NV" },
        });
        expect(getConnectCount()).toBe(1);

        view.unmount();
        expect(getDisconnectCount()).toBe(1);

        // Stability is not deafness: a genuinely different config still
        // has to re-subscribe.
        const onAlert = () => {};
        const first = { symbols: ["AAPL"] };
        const panel = render(<FeedPanel options={first} onAlert={onAlert} />);
        expect(getConnectCount()).toBe(2);

        panel.rerender(<FeedPanel options={first} onAlert={onAlert} />);
        expect(getConnectCount()).toBe(2);

        panel.rerender(
            <FeedPanel options={{ symbols: ["MSFT"] }} onAlert={onAlert} />
        );
        expect(getConnectCount()).toBe(3);
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
