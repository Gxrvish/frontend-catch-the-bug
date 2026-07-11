// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DesignStudio } from "./DesignStudio";
import { _resetRenderCounts, renderCounts } from "./renderProbes";

describe("DesignStudio", () => {
    beforeEach(() => {
        _resetRenderCounts();
    });

    it("does not re-render canvas tiles while typing in the search box", () => {
        render(<DesignStudio />);

        const before = renderCounts.tile;
        const search = screen.getByLabelText("search frames");
        fireEvent.change(search, { target: { value: "F" } });
        fireEvent.change(search, { target: { value: "Fr" } });
        fireEvent.change(search, { target: { value: "Fra" } });

        expect(screen.getAllByTestId("canvas-tile")).toHaveLength(40);
        expect(renderCounts.tile).toBe(before);
    });

    it("does not re-render the user badge when zooming", () => {
        render(<DesignStudio />);

        const before = renderCounts.badge;
        fireEvent.click(screen.getByLabelText("zoom in"));
        fireEvent.click(screen.getByLabelText("zoom in"));
        fireEvent.click(screen.getByLabelText("zoom in"));

        expect(renderCounts.badge).toBe(before);
    });

    it("zooms the tiles and filters them by search", () => {
        render(<DesignStudio />);

        expect(screen.getAllByTestId("canvas-tile")).toHaveLength(40);

        fireEvent.click(screen.getByLabelText("zoom in"));
        expect(screen.getAllByTestId("tile-zoom")[0]).toHaveTextContent("110%");

        fireEvent.change(screen.getByLabelText("search frames"), {
            target: { value: "Frame 04" },
        });
        const tiles = screen.getAllByTestId("canvas-tile");
        expect(tiles).toHaveLength(1);
        expect(tiles[0]).toHaveTextContent("Frame 04");
    });
});
