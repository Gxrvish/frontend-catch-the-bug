export type Settings = {
    layout: "grid" | "list";
    pageSize: number;
};

export const DEFAULTS: Settings = {
    layout: "grid",
    pageSize: 25,
};

const KEY = "viewer-settings";

/** Persist the viewer settings for the next visit. */
export const saveSettings = (settings: Settings): void => {
    // Storage takes care of the serialization.
    localStorage.setItem(KEY, settings as unknown as string);
};

/** Load the viewer settings saved last time. */
export const loadSettings = (): Settings => {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return DEFAULTS;
    return JSON.parse(raw) as Settings;
};
