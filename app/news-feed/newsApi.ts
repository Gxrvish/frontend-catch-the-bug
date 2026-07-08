import type { Article } from "./newsFeed.types";

const seedArticles = (): Article[] => [
    {
        id: "a-101",
        title: "Ferry line adds night crossings",
        summary: "Two extra departures from the harbor start next month.",
    },
    {
        id: "a-102",
        title: "City library extends weekend hours",
        summary: "Reading rooms now open until 22:00 on Saturdays.",
    },
    {
        id: "a-103",
        title: "Tram network trials tap-to-pay",
        summary: "Contactless readers installed on lines 3 and 7.",
    },
    {
        id: "a-104",
        title: "River path reopens after repairs",
        summary: "The flood-damaged section is back for cyclists.",
    },
    {
        id: "a-105",
        title: "Food market moves to the old depot",
        summary: "Forty stalls relocate while the square is rebuilt.",
    },
    {
        id: "a-106",
        title: "Rooftop gardens win planning approval",
        summary: "Six municipal buildings get green roofs in autumn.",
    },
    {
        id: "a-107",
        title: "Marathon route announced for spring",
        summary: "The course crosses all five bridges for the first time.",
    },
    {
        id: "a-108",
        title: "Airport shuttle switches to electric buses",
        summary: "The diesel fleet retires by the end of the year.",
    },
    {
        id: "a-109",
        title: "Open-air cinema returns to the park",
        summary: "Screenings every Friday through August.",
    },
    {
        id: "a-110",
        title: "Harbor baths pass water-quality checks",
        summary: "Swimming season opens two weeks early.",
    },
];

const BREAKING: Article = {
    id: "a-999",
    title: "Breaking: transit strike called off",
    summary: "Unions and the city reached a deal minutes ago.",
};

let articles = seedArticles();
let breakingPublished = false;

const delay = () => new Promise((resolve) => setTimeout(resolve, 150));

// The newsroom publishes a breaking story right after the first page is
// served — live feeds shift under their readers all the time.
const publishBreakingOnce = () => {
    if (!breakingPublished) {
        breakingPublished = true;
        articles = [BREAKING, ...articles];
    }
};

export const fetchPage = async (options: {
    offset: number;
    limit: number;
}): Promise<Article[]> => {
    await delay();
    const slice = articles.slice(
        options.offset,
        options.offset + options.limit
    );
    publishBreakingOnce();
    return slice;
};

export const fetchArticlesAfter = async (options: {
    cursor: string | null;
    limit: number;
}): Promise<Article[]> => {
    await delay();
    const start =
        options.cursor === null
            ? 0
            : articles.findIndex((a) => a.id === options.cursor) + 1;
    const slice = articles.slice(start, start + options.limit);
    publishBreakingOnce();
    return slice;
};

export const _resetNewsApi = () => {
    articles = seedArticles();
    breakingPublished = false;
};
