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

    it("discards an uncommitted draft when the selection changes", () => {
        render(<TrackInspector />);

        fireEvent.change(screen.getByLabelText("track title"), {
            target: { value: "Neon Skyline (Remix)" },
        });

        fireEvent.click(screen.getByText("Gravity Well"));
        fireEvent.click(screen.getByText("Neon Skyline"));

        // Coming back is a fresh edit of the stored track, not a resumed
        // draft nobody saved.
        expect(screen.getByLabelText("track title")).toHaveValue(
            "Neon Skyline"
        );
    });

    it("saves only into the track that is selected", () => {
        render(<TrackInspector />);

        fireEvent.click(screen.getByText("Gravity Well"));
        fireEvent.change(screen.getByLabelText("track title"), {
            target: { value: "Gravity Well II" },
        });
        fireEvent.click(screen.getByText("Save changes"));

        // The other fields of the selected track survive…
        expect(screen.getByText("Gravity Well II")).toBeInTheDocument();
        expect(
            screen.getByText(/Orbit Kids · 140 BPM · E/)
        ).toBeInTheDocument();
        // …and the track that was selected before is untouched.
        expect(screen.getByText("Neon Skyline")).toBeInTheDocument();
        expect(
            screen.getByText(/Velvet Circuit · 118 BPM/)
        ).toBeInTheDocument();
    });

    it("shows saved values again after switching away and back", () => {
        render(<TrackInspector />);

        fireEvent.change(screen.getByLabelText("track bpm"), {
            target: { value: "124" },
        });
        fireEvent.click(screen.getByText("Save changes"));

        fireEvent.click(screen.getByText("Paper Lanterns"));
        expect(screen.getByLabelText("track bpm")).toHaveValue(92);

        fireEvent.click(screen.getByText("Neon Skyline"));
        expect(screen.getByLabelText("track bpm")).toHaveValue(124);
    });
});
