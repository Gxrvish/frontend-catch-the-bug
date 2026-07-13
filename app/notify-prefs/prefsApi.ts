// The preferences backend. THIS IS THE SERVER — the bugs are not in here.
//
// The endpoint is a full PUT: whatever payload arrives REPLACES the stored
// record. Missing keys are gone. That's the documented contract the app
// has to satisfy.

export type PrefsRecord = {
    webhook?: unknown;
    emailAlerts?: unknown;
    digestHour?: unknown;
    plan?: unknown;
};

let stored: PrefsRecord = {
    webhook: "https://hooks.example.com/abc",
    emailAlerts: true,
    digestHour: 8,
    plan: "pro",
};

export const savePrefs = (payload: PrefsRecord): void => {
    stored = { ...payload };
};

export const getStored = (): PrefsRecord => ({ ...stored });

export const _resetPrefsApi = () => {
    stored = {
        webhook: "https://hooks.example.com/abc",
        emailAlerts: true,
        digestHour: 8,
        plan: "pro",
    };
};
