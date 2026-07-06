import type { JoinResult } from "./waitlistSignup.types";

const LATENCY_MS = 150;

// In-memory stand-in for the beta waitlist table. Like the real one, it has
// no unique constraint on email yet (ticket BE-201) — every insert lands.
const entries: string[] = [];

export const joinWaitlist = async (email: string): Promise<JoinResult> => {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    entries.push(email);
    const copies = entries.filter((e) => e === email).length;
    if (copies > 1) {
        return {
            ok: false,
            error: "You were signed up more than once — support has been notified.",
        };
    }
    return { ok: true, position: entries.length };
};

export const entryCount = (email: string) =>
    entries.filter((e) => e === email).length;

export const _resetWaitlist = () => {
    entries.length = 0;
};
