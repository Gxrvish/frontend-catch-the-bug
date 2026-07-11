import type { LegendItem } from "./analyticsTiles.types";

export const STATS = [
    { id: "revenue", label: "Revenue", value: 1_204_000 },
    { id: "aov", label: "Avg order value", value: 5_230 },
];

export const ACTIONS = [
    { id: "sessions", label: "Sessions", value: "18.4k" },
    { id: "signups", label: "Sign-ups", value: "1,204" },
];

export const TRAFFIC_LEGEND: LegendItem[] = [
    { label: "Organic", share: "54%" },
    { label: "Paid", share: "31%" },
    { label: "Referral", share: "15%" },
];

export const DEVICE_LEGEND: LegendItem[] = [
    { label: "Mobile", share: "63%" },
    { label: "Desktop", share: "33%" },
    { label: "Tablet", share: "4%" },
];
