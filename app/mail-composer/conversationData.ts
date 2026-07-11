import type { Conversation } from "./mailComposer.types";

export const CONVERSATIONS: Conversation[] = [
    {
        id: "c-01",
        subject: "Quarterly roadmap review",
        from: "Priya Nair",
        body: "Draft agenda attached — please add your items before Thursday.",
    },
    {
        id: "c-02",
        subject: "Design tokens migration",
        from: "Jonas Weber",
        body: "The new palette lands next sprint; legacy variables stay until Q3.",
    },
    {
        id: "c-03",
        subject: "On-call handover notes",
        from: "Sofia Reyes",
        body: "Two open incidents, both low severity. Runbook links inside.",
    },
    {
        id: "c-04",
        subject: "Team offsite logistics",
        from: "Marcus Chen",
        body: "Venue confirmed. Book travel by Friday for the group rate.",
    },
];
