import type { TeamSettings, TeamSettingsDraft } from "./teamSettings.types";

const INITIAL: TeamSettings = {
    teamName: "Platform Guild",
    webhookUrl: "https://hooks.example.com/platform",
    version: 1,
};

export const TEAMMATE_WEBHOOK = "https://hooks.example.com/incidents-eu";

let serverDoc: TeamSettings = { ...INITIAL };

export class ConflictError extends Error {
    constructor() {
        super("409: settings changed since you loaded them");
        this.name = "ConflictError";
    }
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 150));

export const loadSettings = async (): Promise<TeamSettings> => {
    await delay();
    return { ...serverDoc };
};

// Compare-and-set write: the server only accepts the document if the
// caller proves it saw the current version (like HTTP If-Match / ETags).
export const saveSettings = async (
    draft: TeamSettingsDraft,
    baseVersion: number
): Promise<TeamSettings> => {
    await delay();
    if (baseVersion !== serverDoc.version) {
        throw new ConflictError();
    }
    serverDoc = { ...draft, version: serverDoc.version + 1 };
    return { ...serverDoc };
};

// Simulates a teammate saving from another browser tab.
export const _teammateEdit = () => {
    serverDoc = {
        ...serverDoc,
        webhookUrl: TEAMMATE_WEBHOOK,
        version: serverDoc.version + 1,
    };
};

export const getServerSettings = (): TeamSettings => ({ ...serverDoc });

export const _resetSettingsApi = () => {
    serverDoc = { ...INITIAL };
};
