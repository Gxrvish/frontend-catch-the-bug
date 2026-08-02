// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrailerGrid } from "./TrailerGrid";

describe("TrailerGrid", () => {
    it("closes the preview when the close button is clicked", () => {
        render(<TrailerGrid />);

        fireEvent.click(screen.getByText("Orbit Decay — Teaser"));
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("close preview"));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not count clicks inside the preview as card clicks", () => {
        render(<TrailerGrid />);

        fireEvent.click(screen.getByText("Orbit Decay — Teaser"));
        expect(screen.getByTestId("card-click-count")).toHaveTextContent("1");

        fireEvent.click(screen.getByText("+ Add to Queue"));

        // The queue add itself works...
        expect(screen.getByTestId("queue-count")).toHaveTextContent("1");
        // ...but it must not register as another CARD click.
        expect(screen.getByTestId("card-click-count")).toHaveTextContent("1");
    });

    it("closes the preview when the backdrop is clicked", () => {
        render(<TrailerGrid />);

        fireEvent.click(screen.getByText("Orbit Decay — Teaser"));
        const backdrop = screen.getByRole("dialog").parentElement!;

        fireEvent.click(backdrop);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByTestId("card-click-count")).toHaveTextContent("1");
    });

    it("keeps the preview open while its own controls are used", () => {
        render(<TrailerGrid />);

        fireEvent.click(screen.getByText("Orbit Decay — Teaser"));
        fireEvent.click(screen.getByText("🔇 Muted"));

        // The control does its own job and nothing else's.
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("🔊 Sound on")).toBeInTheDocument();
        expect(screen.getByTestId("card-click-count")).toHaveTextContent("1");
    });

    it("counts repeated queue adds without touching card analytics", () => {
        render(<TrailerGrid />);

        fireEvent.click(screen.getByText("Orbit Decay — Teaser"));
        fireEvent.click(screen.getByText("+ Add to Queue"));
        fireEvent.click(screen.getByText("+ Add to Queue"));

        expect(screen.getByTestId("queue-count")).toHaveTextContent("2");
        expect(screen.getByTestId("card-click-count")).toHaveTextContent("1");
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});
