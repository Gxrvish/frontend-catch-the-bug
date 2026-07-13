// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SlideSorter } from "./SlideSorter";

// Minimal DataTransfer stand-in — jsdom does not ship one.
const makeDataTransfer = () => {
    const data: Record<string, string> = {};
    return {
        setData: (format: string, value: string) => {
            data[format] = value;
        },
        getData: (format: string) => data[format] ?? "",
    };
};

const titles = () =>
    screen
        .getAllByTestId(/^slide-/)
        .map((slide) => slide.textContent?.replace(/^\d+\./, "") ?? "");

describe("SlideSorter", () => {
    it("accepts drops by cancelling dragover", () => {
        render(<SlideSorter />);
        const dataTransfer = makeDataTransfer();

        fireEvent.dragStart(screen.getByTestId("slide-s1"), { dataTransfer });
        // fireEvent returns false when the handler called preventDefault —
        // an uncancelled dragover means the browser never fires drop.
        const notCancelled = fireEvent.dragOver(
            screen.getByTestId("slide-s3"),
            { dataTransfer }
        );

        expect(notCancelled).toBe(false);
    });

    it("reorders the deck when a slide is dropped on another", () => {
        render(<SlideSorter />);
        const dataTransfer = makeDataTransfer();

        fireEvent.dragStart(screen.getByTestId("slide-s1"), { dataTransfer });
        fireEvent.dragOver(screen.getByTestId("slide-s3"), { dataTransfer });
        fireEvent.drop(screen.getByTestId("slide-s3"), { dataTransfer });

        expect(titles()).toEqual(["Roadmap", "Opening", "Demo", "Q&A"]);
    });

    it("clears the drag ghost when a drag is cancelled", () => {
        render(<SlideSorter />);
        const dataTransfer = makeDataTransfer();
        const slide = screen.getByTestId("slide-s2");

        fireEvent.dragStart(slide, { dataTransfer });
        expect(slide).toHaveAttribute("data-dragging", "true");

        // Escape / dropping outside fires dragend with no drop.
        fireEvent.dragEnd(slide, { dataTransfer });

        expect(slide).toHaveAttribute("data-dragging", "false");
    });

    it("renders all four slides in order", () => {
        render(<SlideSorter />);

        expect(titles()).toEqual(["Opening", "Roadmap", "Demo", "Q&A"]);
    });
});
