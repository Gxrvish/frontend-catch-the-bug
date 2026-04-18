export type ActivityType = "post" | "comment" | "reaction" | "follow" | "share";

export interface Actor {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface ActivityItem {
    id: string;
    actor: Actor;
    type: ActivityType;
    content: string;
    isLiked: boolean;
    likeCount: number;
    commentCount: number;
    createdAt: number;
    updatedAt: number;
}

export interface FeedPage {
    items: ActivityItem[];
    hasMore: boolean;
}
