// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TOTAL_ENTRIES } from "./logData";
import { LogViewer, ROW_HEIGHT } from "./LogViewer";

// Generous timeouts: on the buggy build, mounting 10,000 rows can take
// several seconds — the failure should be the row-count assertion, not a
// test timeout.
const SLOW = { timeout: 30_000 };

describe("LogViewer", () => {
    it(
        "windows the list: scrolled rows appear without mounting all 10,000",
        SLOW,
        () => {
            render(<LogViewer />);

            const scroller = screen.getByTestId("log-scroller");
            scroller.scrollTop = 5000 * ROW_HEIGHT;
            fireEvent.scroll(scroller);

            expect(
                screen.getByText("#5001 Deploy pipeline finished")
            ).toBeInTheDocument();
            expect(screen.getAllByTestId("log-row").length).toBeLessThanOrEqual(
                60
            );
        }
    );

    it("follows the scroll back to the top and out to the end", SLOW, () => {
        render(<LogViewer />);
        const scroller = screen.getByTestId("log-scroller");

        const scrollTo = (row: number) => {
            scroller.scrollTop = row * ROW_HEIGHT;
            fireEvent.scroll(scroller);
        };

        scrollTo(5000);
        expect(
            screen.getByText("#5001 Deploy pipeline finished")
        ).toBeInTheDocument();

        // A fixed window that never moves would pass the scroll-down test
        // on its own.
        scrollTo(0);
        expect(
            screen.getByText("#1 Deploy pipeline finished")
        ).toBeInTheDocument();
        expect(
            screen.queryByText("#5001 Deploy pipeline finished")
        ).not.toBeInTheDocument();
        expect(screen.getAllByTestId("log-row").length).toBeLessThanOrEqual(60);

        // …and the far end must not run off the array.
        scrollTo(TOTAL_ENTRIES - 5);
        expect(
            screen.getByText(`#${TOTAL_ENTRIES} Connection pool saturated`)
        ).toBeInTheDocument();
        expect(screen.getAllByTestId("log-row").length).toBeLessThanOrEqual(60);
    });

    it("keeps neighbouring rows and their levels intact", SLOW, () => {
        render(<LogViewer />);
        const scroller = screen.getByTestId("log-scroller");
        scroller.scrollTop = 5000 * ROW_HEIGHT;
        fireEvent.scroll(scroller);

        expect(
            screen.getByText("#5000 Connection pool saturated")
        ).toBeInTheDocument();
        expect(
            screen.getByText("#5002 Cache warmed for eu-west-1")
        ).toBeInTheDocument();
        // Windowing must not strip what each row renders.
        expect(screen.getAllByTestId("log-row")[0]).toHaveTextContent(
            /info|warn|error/
        );
        expect(screen.getAllByTestId("log-row").length).toBeLessThanOrEqual(60);
    });

    it("shows the entry count and the first entries at the top", SLOW, () => {
        render(<LogViewer />);

        expect(screen.getByText(/10,000 entries/)).toBeInTheDocument();
        expect(
            screen.getByText("#1 Deploy pipeline finished")
        ).toBeInTheDocument();
        expect(
            screen.getByText("#2 Cache warmed for eu-west-1")
        ).toBeInTheDocument();
    });
});
