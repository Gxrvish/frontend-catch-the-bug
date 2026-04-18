import type {
    ActivityItem,
    ActivityType,
    Actor,
    FeedPage,
} from "./activityFeed.types";

const ACTORS: Actor[] = [
    { id: "u1", name: "Alice Chen", avatarUrl: "/avatars/alice.jpg" },
    { id: "u2", name: "Bob Smith", avatarUrl: "/avatars/bob.jpg" },
    { id: "u3", name: "Carol Wu", avatarUrl: "/avatars/carol.jpg" },
    { id: "u4", name: "Dave Kim", avatarUrl: "/avatars/dave.jpg" },
    { id: "u5", name: "Eve Johnson", avatarUrl: "/avatars/eve.jpg" },
    { id: "u6", name: "Frank Lee", avatarUrl: "/avatars/frank.jpg" },
];

const TEMPLATES: string[] = [
    "posted a new update about the Q4 roadmap",
    "commented on the design review thread",
    "reacted to the team announcement",
    "started following the engineering blog",
    "shared a link to the new documentation",
    "posted a question in the support channel",
    "uploaded new assets to the media library",
    "completed the onboarding checklist",
    "created a new pull request",
    "merged the feature branch into main",
];

const TYPES: ActivityType[] = [
    "post",
    "comment",
    "reaction",
    "follow",
    "share",
];

const serverStore = new Map<string, ActivityItem>();
const chronologicalIds: string[] = [];
let idSeq = 0;

function createServerItem(): ActivityItem {
    const id = `act-${++idSeq}`;
    const actor = ACTORS[Math.floor(Math.random() * ACTORS.length)];
    const item: ActivityItem = {
        id,
        actor,
        type: TYPES[Math.floor(Math.random() * TYPES.length)],
        content: TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)],
        isLiked: false,
        likeCount: Math.floor(Math.random() * 25),
        commentCount: Math.floor(Math.random() * 12),
        createdAt: Date.now() - Math.floor(Math.random() * 60000),
        updatedAt: Date.now(),
    };
    serverStore.set(id, item);
    chronologicalIds.unshift(id);
    if (chronologicalIds.length > 60) chronologicalIds.pop();
    return { ...item };
}

for (let i = 0; i < 15; i += 1) createServerItem();

function withLatency(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true }
        );
    });
}

export async function fetchRecentItems(
    signal?: AbortSignal
): Promise<FeedPage> {
    await withLatency(800 + Math.random() * 1400, signal);

    if (Math.random() > 0.35) {
        createServerItem();
    }

    const count = 3 + Math.floor(Math.random() * 5);
    const start = Math.floor(
        Math.random() * Math.min(count, chronologicalIds.length)
    );
    const batch: ActivityItem[] = [];

    for (
        let i = start;
        i < Math.min(start + count, chronologicalIds.length);
        i += 1
    ) {
        const stored = serverStore.get(chronologicalIds[i]);
        if (stored) batch.push({ ...stored });
    }

    return {
        items: batch,
        hasMore: chronologicalIds.length > 25,
    };
}

export async function fetchOlderItems(
    beforeId: string,
    limit: number,
    signal?: AbortSignal
): Promise<FeedPage> {
    await withLatency(400 + Math.random() * 800, signal);

    const idx = chronologicalIds.indexOf(beforeId);
    if (idx === -1) return { items: [], hasMore: false };

    const start = idx + 1;
    const end = Math.min(start + limit, chronologicalIds.length);
    const items: ActivityItem[] = [];

    for (let i = start; i < end; i += 1) {
        const stored = serverStore.get(chronologicalIds[i]);
        if (stored) items.push({ ...stored });
    }

    return { items, hasMore: end < chronologicalIds.length };
}

export async function toggleLikeApi(
    itemId: string,
    signal?: AbortSignal
): Promise<ActivityItem> {
    await withLatency(2000 + Math.random() * 2500, signal);

    const stored = serverStore.get(itemId);
    if (!stored) throw new Error(`Item ${itemId} not found`);

    stored.isLiked = !stored.isLiked;
    stored.likeCount = stored.isLiked
        ? stored.likeCount + 1
        : Math.max(0, stored.likeCount - 1);
    stored.updatedAt = Date.now();

    return { ...stored };
}

export async function dismissItemApi(
    itemId: string,
    signal?: AbortSignal
): Promise<void> {
    await withLatency(400 + Math.random() * 400, signal);
    serverStore.delete(itemId);
    const idx = chronologicalIds.indexOf(itemId);
    if (idx !== -1) chronologicalIds.splice(idx, 1);
}
