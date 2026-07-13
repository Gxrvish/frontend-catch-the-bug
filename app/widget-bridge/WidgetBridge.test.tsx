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

    it("delivers the first submit to the host", () => {
        render(<WidgetBridge />);

        fireEvent.click(screen.getByTestId("star-3"));
        fireEvent.click(screen.getByTestId("submit"));

        expect(screen.getByTestId("submitted")).toHaveTextContent("3");
    });
});
