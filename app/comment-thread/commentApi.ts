import type { CommentRecord } from "./commentThread.types";

const LATENCY_MS = 150;
const BANNED = /\bspam\b/i;

let seq = 0;

export const SEED_COMMENTS: CommentRecord[] = [
    { id: "c-seed-1", author: "mira", text: "This mix is incredible." },
    {
        id: "c-seed-2",
        author: "theo",
        text: "Dropping this straight into my study playlist.",
    },
];

export const postComment = async (
    text: string,
    author: string
): Promise<CommentRecord> => {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    if (BANNED.test(text)) {
        throw new Error("Comment rejected by moderation.");
    }

    seq += 1;
    return { id: `c-${seq}`, author, text };
};
