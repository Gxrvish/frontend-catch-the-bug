// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { _resetNewsApi } from "./newsApi";
import { NewsFeed } from "./NewsFeed";

describe("NewsFeed", () => {
    beforeEach(() => {
        _resetNewsApi();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("loads more without repeating or losing an article", async () => {
        render(<NewsFeed />);

        expect(
            await screen.findByText("Ferry line adds night crossings")
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Load more" }));

        expect(
            await screen.findByText("Harbor baths pass water-quality checks")
        ).toBeInTheDocument();

        const ids = screen
            .getAllByTestId("news-article")
            .map((el) => el.getAttribute("data-article-id"));
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("renders the first page in order", async () => {
        render(<NewsFeed />);

        expect(
            await screen.findByText("Ferry line adds night crossings")
        ).toBeInTheDocument();

        const titles = screen
            .getAllByTestId("news-article")
            .map((el) => el.querySelector("h3")?.textContent);
        expect(titles).toEqual([
            "Ferry line adds night crossings",
            "City library extends weekend hours",
            "Tram network trials tap-to-pay",
            "River path reopens after repairs",
            "Food market moves to the old depot",
        ]);
    });
});
