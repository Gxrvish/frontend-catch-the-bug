export type Conversation = {
    id: string;
    subject: string;
    from: string;
    body: string;
};

export type ComposeMode = "reply" | "forward";
