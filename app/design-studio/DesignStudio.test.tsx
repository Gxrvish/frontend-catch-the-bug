// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DesignStudio } from "./DesignStudio";
import { _resetRenderCounts, renderCounts } from "./renderProbes";

const search = (text: string) =>
    fireEvent.change(screen.getByLabelText("search frames"), {
        target: { value: text },
    });

const zoomIn = () => fireEvent.click(screen.getByLabelText("zoom in"));
const zoomOut = () => fireEvent.click(screen.getByLabelText("zoom out"));

const tileZoom = () => screen.getAllByTestId("tile-zoom")[0];

describe("DesignStudio", () => {
    beforeEach(() => {
        _resetRenderCounts();
    });

    it("does not re-render canvas tiles while typing in the search box", () => {
        render(<DesignStudio />);

        const before = renderCounts.tile;
        const searchBox = screen.getByLabelText("search frames");
        fireEvent.change(searchBox, { target: { value: "F" } });
        fireEvent.change(searchBox, { target: { value: "Fr" } });
        fireEvent.change(searchBox, { target: { value: "Fra" } });

        expect(screen.getAllByTestId("canvas-tile")).toHaveLength(40);
        expect(renderCounts.tile).toBe(before);
    });

    it("re-renders tiles for zoom but not for search", () => {
        render(<DesignStudio />);

        const beforeSearch = renderCounts.tile;
        search("Frame");
        expect(screen.getAllByTestId("canvas-tile")).toHaveLength(40);
        expect(renderCounts.tile - beforeSearch).toBe(0);

        // Tiles read zoom, so zoom has to reach them — a probe that never
        // moves means the tiles went deaf, not quiet.
        const beforeZoom = renderCounts.tile;
        zoomIn();
        expect(renderCounts.tile - beforeZoom).toBe(40);
        expect(tileZoom()).toHaveTextContent("110%");
    });

    it("does not re-render the user badge when zooming", () => {
        render(<DesignStudio />);

        const before = renderCounts.badge;
        fireEvent.click(screen.getByLabelText("zoom in"));
        fireEvent.click(screen.getByLabelText("zoom in"));
        fireEvent.click(screen.getByLabelText("zoom in"));

        expect(renderCounts.badge).toBe(before);
    });

    it("does not re-render the user badge while typing in search", () => {
        render(<DesignStudio />);

        const before = renderCounts.badge;
        search("F");
        search("Fr");
        search("Fra");

        // The badge reads `user`, which no interaction on this page
        // touches — neither channel should reach it.
        expect(renderCounts.badge - before).toBe(0);
    });

    it("clamps zoom at its bounds without waking the badge", () => {
        render(<DesignStudio />);

        const before = renderCounts.badge;
        for (let i = 0; i < 12; i += 1) zoomOut();
        expect(tileZoom()).toHaveTextContent("10%");

        expect(renderCounts.badge - before).toBe(0);
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
