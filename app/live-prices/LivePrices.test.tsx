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
