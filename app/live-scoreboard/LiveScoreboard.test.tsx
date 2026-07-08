// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiveScoreboard } from "./LiveScoreboard";

describe("LiveScoreboard", () => {
    it("settles on the newest score even when events arrive out of order", async () => {
        render(<LiveScoreboard />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 150));
        });

        expect(screen.getByTestId("scoreline")).toHaveTextContent(
            "Rovers 2 – 1 United"
        );
    });

    it("shows the kick-off state before any event arrives", () => {
        render(<LiveScoreboard />);

        expect(screen.getByTestId("scoreline")).toHaveTextContent(
            "Rovers 0 – 0 United"
        );
        expect(screen.getByTestId("last-note")).toHaveTextContent("Kick-off");
    });
});
