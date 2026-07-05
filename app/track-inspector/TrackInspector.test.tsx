// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrackInspector } from "./TrackInspector";

describe("TrackInspector", () => {
    it("shows the newly selected track in the edit panel", () => {
        render(<TrackInspector />);

        // "Neon Skyline" (trk-1) is selected by default.
        expect(screen.getByLabelText("track title")).toHaveValue(
            "Neon Skyline"
        );

        // Select a different track — the panel must follow the selection.
        fireEvent.click(screen.getByText("Gravity Well"));

        expect(screen.getByTestId("editing-id")).toHaveTextContent("trk-2");
        expect(screen.getByLabelText("track title")).toHaveValue(
            "Gravity Well"
        );
        expect(screen.getByLabelText("track bpm")).toHaveValue(140);
        expect(screen.getByLabelText("explicit flag")).toBeChecked();
    });

    it("keeps draft edits out of the library until Save is clicked", () => {
        render(<TrackInspector />);

        fireEvent.change(screen.getByLabelText("track title"), {
            target: { value: "Neon Skyline (Remix)" },
        });

        // The list on the left still shows the original title…
        expect(screen.getByText("Neon Skyline")).toBeInTheDocument();

        // …until the draft is committed.
        fireEvent.click(screen.getByText("Save changes"));
        expect(screen.getByText("Neon Skyline (Remix)")).toBeInTheDocument();
    });
});
