// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaylistEditor } from "./PlaylistEditor";

describe("PlaylistEditor", () => {
    it("keeps a note attached to its track when the list is sorted", () => {
        render(<PlaylistEditor />);

        fireEvent.change(screen.getByLabelText("note for Neon Harbor"), {
            target: { value: "skip the intro" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Sort by duration" })
        );

        expect(screen.getByLabelText("note for Neon Harbor")).toHaveValue(
            "skip the intro"
        );
        expect(
            screen.getByLabelText("note for Coastline Repeater")
        ).toHaveValue("");
    });

    it("updates the total runtime when a track is removed", () => {
        render(<PlaylistEditor />);

        fireEvent.click(
            screen.getByRole("button", { name: "remove Neon Harbor" })
        );

        expect(screen.getByTestId("total-runtime")).toHaveTextContent(
            "Total runtime: 25m 32s"
        );
    });

    it("renders the seeded playlist in order with the correct total", () => {
        render(<PlaylistEditor />);

        const titles = screen
            .getAllByTestId("track-title")
            .map((el) => el.textContent);
        expect(titles).toEqual([
            "Neon Harbor",
            "Paper Planes at Dawn",
            "Static Bloom",
            "Coastline Repeater",
            "Glass Orchard",
            "Midnight Freight",
            "Low Tide Arithmetic",
            "Departure Board",
        ]);
        expect(screen.getByTestId("total-runtime")).toHaveTextContent(
            "Total runtime: 29m 46s"
        );
    });
});
