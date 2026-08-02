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

    it("loads every story exactly once across two pages", async () => {
        render(<NewsFeed />);
        await screen.findByText("Ferry line adds night crossings");

        fireEvent.click(screen.getByRole("button", { name: "Load more" }));
        await screen.findByText("Harbor baths pass water-quality checks");

        // Over-fetching and filtering the duplicates out client-side
        // still leaves the sequence to drift on the next page.
        const ids = screen
            .getAllByTestId("news-article")
            .map((el) => el.getAttribute("data-article-id"));
        expect(ids).toEqual([
            "a-101",
            "a-102",
            "a-103",
            "a-104",
            "a-105",
            "a-106",
            "a-107",
            "a-108",
            "a-109",
            "a-110",
        ]);
    });

    it("handles reaching the end of the feed", async () => {
        render(<NewsFeed />);
        await screen.findByText("Ferry line adds night crossings");

        fireEvent.click(screen.getByRole("button", { name: "Load more" }));
        await screen.findByText("Harbor baths pass water-quality checks");

        fireEvent.click(screen.getByRole("button", { name: "Load more" }));
        await new Promise((resolve) => setTimeout(resolve, 250));

        // Past the last story there is nothing to add and nothing to lose.
        const ids = screen
            .getAllByTestId("news-article")
            .map((el) => el.getAttribute("data-article-id"));
        expect(ids).toHaveLength(10);
        expect(new Set(ids).size).toBe(10);
        expect(ids[9]).toBe("a-110");
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
