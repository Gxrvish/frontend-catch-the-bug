// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { LivePrices } from "./LivePrices";
import { emitMarketTick, priceSocket } from "./pricesApi";

describe("LivePrices", () => {
    beforeEach(() => {
        priceSocket.reset();
    });

    it("processes each tick exactly once under StrictMode", () => {
        render(
            <StrictMode>
                <LivePrices autoTicks={false} />
            </StrictMode>
        );

        // After StrictMode's mount → cleanup → remount cycle, exactly one
        // live subscription may remain.
        expect(priceSocket.listenerCount()).toBe(1);

        act(() => {
            emitMarketTick({ symbol: "BTC", price: 70000 });
        });

        // One tick emitted → one update received. Not two.
        expect(screen.getByTestId("update-count")).toHaveTextContent(
            "updates received: 1"
        );
    });

    it("unsubscribes when the component unmounts", () => {
        const { unmount } = render(
            <StrictMode>
                <LivePrices autoTicks={false} />
            </StrictMode>
        );

        unmount();

        // A guard that merely avoids the second subscribe still leaves a
        // listener behind for the life of the process.
        expect(priceSocket.listenerCount()).toBe(0);
    });

    it("resubscribes cleanly after a remount", () => {
        const first = render(
            <StrictMode>
                <LivePrices autoTicks={false} />
            </StrictMode>
        );
        first.unmount();

        render(
            <StrictMode>
                <LivePrices autoTicks={false} />
            </StrictMode>
        );

        expect(priceSocket.listenerCount()).toBe(1);

        act(() => {
            emitMarketTick({ symbol: "BTC", price: 70000 });
        });

        expect(screen.getByTestId("update-count")).toHaveTextContent(
            "updates received: 1"
        );
    });

    it("counts a burst of ticks one for one", () => {
        render(
            <StrictMode>
                <LivePrices autoTicks={false} />
            </StrictMode>
        );

        act(() => {
            emitMarketTick({ symbol: "BTC", price: 70000 });
            emitMarketTick({ symbol: "ETH", price: 4000 });
            emitMarketTick({ symbol: "SOL", price: 150 });
        });

        expect(screen.getByTestId("update-count")).toHaveTextContent(
            "updates received: 3"
        );
        expect(screen.getByTestId("listener-count")).toHaveTextContent(
            "socket listeners: 1"
        );
    });

    it("applies ticks to the price table", () => {
        render(
            <StrictMode>
                <LivePrices autoTicks={false} />
            </StrictMode>
        );

        act(() => {
            emitMarketTick({ symbol: "ETH", price: 4444.5 });
        });

        expect(screen.getByText("$4,444.5")).toBeInTheDocument();
    });
});
