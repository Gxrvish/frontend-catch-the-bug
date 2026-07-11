export type FeedItem = {
    id: string;
    label: string;
};

export type PageResult = {
    items: FeedItem[];
    nextCursor: string;
};

export type PreviousResult = {
    items: FeedItem[];
    prevCursor: string;
};

const PAGE_SIZE = 5;

let fetchLog: string[] = [];

export const getFetchLog = () => [...fetchLog];

export const _resetFeedApi = () => {
    fetchLog = [];
};

export const fetchPage = async (cursor: string): Promise<PageResult> => {
    fetchLog.push(cursor);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const page = Number(cursor);
    const start = page * PAGE_SIZE;
    const items = Array.from({ length: PAGE_SIZE }, (_, i) => ({
        id: `item-${start + i}`,
        label: `Item ${start + i}`,
    }));
    return { items, nextCursor: String(page + 1) };
};

export const fetchPrevious = async (
    cursor: string
): Promise<PreviousResult> => {
    fetchLog.push(`prev-${cursor}`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const page = Number(cursor);
    const items = Array.from({ length: PAGE_SIZE }, (_, i) => ({
        id: `older-${page}-${i}`,
        label: `Older ${page}·${i}`,
    }));
    return { items, prevCursor: String(page - 1) };
};
