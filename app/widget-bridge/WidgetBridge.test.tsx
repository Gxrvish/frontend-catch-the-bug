// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WidgetBridge } from "./WidgetBridge";

describe("WidgetBridge", () => {
    it("shows the live rating as the user picks stars", () => {
        render(<WidgetBridge />);

        fireEvent.click(screen.getByTestId("star-4"));

        expect(screen.getByTestId("live")).toHaveTextContent("4");
    });

    it("tracks every submit, not just the first", () => {
        render(<WidgetBridge />);

        fireEvent.click(screen.getByTestId("star-3"));
        fireEvent.click(screen.getByTestId("submit"));
        fireEvent.click(screen.getByTestId("star-5"));
        fireEvent.click(screen.getByTestId("submit"));

        expect(screen.getByTestId("submitted")).toHaveTextContent("5");
    });

    it("follows every star pick, not just the first", () => {
        render(<WidgetBridge />);

        fireEvent.click(screen.getByTestId("star-2"));
        expect(screen.getByTestId("live")).toHaveTextContent("2");

        fireEvent.click(screen.getByTestId("star-5"));
        expect(screen.getByTestId("live")).toHaveTextContent("5");

        fireEvent.click(screen.getByTestId("star-1"));
        expect(screen.getByTestId("live")).toHaveTextContent("1");
    });

    it("keeps live and submitted independent", () => {
        render(<WidgetBridge />);

        // Nothing submitted yet.
        expect(screen.getByTestId("submitted")).toHaveTextContent("—");

        fireEvent.click(screen.getByTestId("star-4"));
        expect(screen.getByTestId("live")).toHaveTextContent("4");
        expect(screen.getByTestId("submitted")).toHaveTextContent("—");

        fireEvent.click(screen.getByTestId("submit"));
        expect(screen.getByTestId("submitted")).toHaveTextContent("4");

        // Picking again moves the live value without re-submitting.
        fireEvent.click(screen.getByTestId("star-2"));
        expect(screen.getByTestId("live")).toHaveTextContent("2");
        expect(screen.getByTestId("submitted")).toHaveTextContent("4");
    });

    it("stops listening on both channels after unmount", () => {
        const { unmount } = render(<WidgetBridge />);
        fireEvent.click(screen.getByTestId("star-3"));
        fireEvent.click(screen.getByTestId("submit"));

        unmount();

        // Nothing left to receive the widget's events.
        expect(() => {
            document.dispatchEvent(
                new CustomEvent("rating:change", { detail: { stars: 1 } })
            );
            document.dispatchEvent(
                new CustomEvent("rating:submit", { detail: { stars: 1 } })
            );
        }).not.toThrow();
    });

    it("delivers the first submit to the host", () => {
        render(<WidgetBridge />);

        fireEvent.click(screen.getByTestId("star-3"));
        fireEvent.click(screen.getByTestId("submit"));

        expect(screen.getByTestId("submitted")).toHaveTextContent("3");
    });
});
