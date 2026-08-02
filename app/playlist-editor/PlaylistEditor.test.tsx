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

    it("keeps a note attached to its track when the list is filtered", () => {
        render(<PlaylistEditor />);
        const hideShort = screen.getByRole("checkbox");

        // Glass Orchard sits after two tracks the filter removes, so its
        // position changes even though the track does not.
        fireEvent.change(screen.getByLabelText("note for Glass Orchard"), {
            target: { value: "peak of the mix" },
        });

        fireEvent.click(hideShort);
        expect(screen.getByLabelText("note for Glass Orchard")).toHaveValue(
            "peak of the mix"
        );
        expect(
            screen.queryByLabelText("note for Coastline Repeater")
        ).toBeNull();

        fireEvent.click(hideShort);
        expect(screen.getByLabelText("note for Glass Orchard")).toHaveValue(
            "peak of the mix"
        );
        expect(
            screen.getByLabelText("note for Coastline Repeater")
        ).toHaveValue("");
    });

    it("keeps the runtime honest across removal and filtering", () => {
        render(<PlaylistEditor />);

        // 29m 46s − 4:14 (Neon Harbor) = 25m 32s
        fireEvent.click(
            screen.getByRole("button", { name: "remove Neon Harbor" })
        );
        expect(screen.getByTestId("total-runtime")).toHaveTextContent(
            "Total runtime: 25m 32s"
        );

        // Hiding rows is a view concern — the playlist is still the same
        // length.
        fireEvent.click(screen.getByRole("checkbox"));
        expect(screen.getByTestId("total-runtime")).toHaveTextContent(
            "Total runtime: 25m 32s"
        );
    });

    it("removes the row the button belongs to, state and all", () => {
        render(<PlaylistEditor />);

        fireEvent.change(screen.getByLabelText("note for Neon Harbor"), {
            target: { value: "first" },
        });
        fireEvent.change(
            screen.getByLabelText("note for Paper Planes at Dawn"),
            { target: { value: "second" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "remove Neon Harbor" })
        );

        expect(screen.queryByLabelText("note for Neon Harbor")).toBeNull();
        expect(
            screen.getByLabelText("note for Paper Planes at Dawn")
        ).toHaveValue("second");
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
