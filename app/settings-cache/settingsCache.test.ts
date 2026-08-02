// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULTS, loadSettings, saveSettings } from "./settingsCache";

describe("settingsCache", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("round-trips the settings object", () => {
        saveSettings({ layout: "list", pageSize: 50 });

        expect(loadSettings()).toEqual({ layout: "list", pageSize: 50 });
    });

    it("falls back to defaults when the stored value is corrupt", () => {
        // A previous release, an extension, or a truncated write left
        // garbage behind — loading must never throw.
        localStorage.setItem("viewer-settings", "{layout:grid");

        expect(() => loadSettings()).not.toThrow();
        expect(loadSettings()).toEqual(DEFAULTS);
    });

    it("stores a string the next load can actually parse", () => {
        saveSettings({ layout: "list", pageSize: 50 });

        const raw = localStorage.getItem("viewer-settings");
        expect(typeof raw).toBe("string");
        expect(() => JSON.parse(raw as string)).not.toThrow();

        // And the second save wins.
        saveSettings({ layout: "grid", pageSize: 10 });
        expect(loadSettings()).toEqual({ layout: "grid", pageSize: 10 });
    });

    it("treats a well-formed but wrong value as corrupt", () => {
        // Everything here is valid JSON and none of it is a Settings.
        for (const stored of ["null", "42", '"grid"', "[1,2]"]) {
            localStorage.setItem("viewer-settings", stored);
            expect(loadSettings()).toEqual(DEFAULTS);
        }

        // A half-written record must not leave a hole in the result.
        localStorage.setItem("viewer-settings", '{"layout":"list"}');
        const partial = loadSettings();
        expect(typeof partial.pageSize).toBe("number");
        expect(["grid", "list"]).toContain(partial.layout);
    });

    it("recovers once a good value is saved over a corrupt one", () => {
        localStorage.setItem("viewer-settings", "{layout:grid");
        expect(loadSettings()).toEqual(DEFAULTS);

        saveSettings({ layout: "list", pageSize: 100 });

        expect(loadSettings()).toEqual({ layout: "list", pageSize: 100 });
    });

    it("returns defaults when nothing is stored", () => {
        expect(loadSettings()).toEqual(DEFAULTS);
    });
});
