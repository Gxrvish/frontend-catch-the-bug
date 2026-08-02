// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _clearOps, _resetLayout, _setRect, getOps } from "./layoutOps";
import { _resetPaintProbe, getPaintTop, TooltipLayer } from "./TooltipLayer";

const seedGeometry = () => {
    _setRect("anchor", { top: 24, height: 16 });
    [0, 1, 2, 3].forEach((index) =>
        _setRect(`badge-${index}`, { top: 0, height: 20 })
    );
};

describe("TooltipLayer", () => {
    beforeEach(() => {
        _resetLayout();
        _resetPaintProbe();
        seedGeometry();
    });

    it("positions the tooltip before the browser can paint it", () => {
        render(<TooltipLayer />);

        // The probe reads the tooltip at paint time: it must already sit
        // under its anchor (24 + 16), not at its unpositioned default.
        expect(getPaintTop()).toBe("40px");
    });

    it("measures every badge before it moves any of them", () => {
        render(<TooltipLayer />);
        _clearOps();

        fireEvent.click(screen.getByRole("button", { name: /re-measure/i }));

        const ops = getOps();
        expect(ops).toHaveLength(8);
        // No write may land between two reads — that is what forces a
        // synchronous reflow on every iteration.
        expect(ops.indexOf("write")).toBeGreaterThan(ops.lastIndexOf("read"));
    });

    it("stacks the badges where the measurements say", () => {
        render(<TooltipLayer />);
        _clearOps();

        fireEvent.click(screen.getByRole("button", { name: /re-measure/i }));

        // Batching the reads must not change the answer: 20px tall with a
        // 4px gap.
        expect(
            screen.getAllByTestId("badge").map((badge) => badge.style.top)
        ).toEqual(["0px", "24px", "48px", "72px"]);
        const ops = getOps();
        expect(ops.indexOf("write")).toBeGreaterThan(ops.lastIndexOf("read"));
    });

    it("keeps the batching on a second re-measure", () => {
        render(<TooltipLayer />);

        fireEvent.click(screen.getByRole("button", { name: /re-measure/i }));
        _clearOps();
        fireEvent.click(screen.getByRole("button", { name: /re-measure/i }));

        const ops = getOps();
        expect(ops).toHaveLength(8);
        expect(ops.indexOf("write")).toBeGreaterThan(ops.lastIndexOf("read"));
        expect(
            screen.getAllByTestId("badge").map((badge) => badge.style.top)
        ).toEqual(["0px", "24px", "48px", "72px"]);
    });

    it("renders the tooltip text and every badge", () => {
        render(<TooltipLayer />);

        expect(screen.getByTestId("tooltip")).toHaveTextContent("Ships Friday");
        expect(screen.getAllByTestId("badge")).toHaveLength(4);
    });
});
