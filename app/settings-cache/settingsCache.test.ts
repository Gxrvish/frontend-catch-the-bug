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

    it("returns defaults when nothing is stored", () => {
        expect(loadSettings()).toEqual(DEFAULTS);
    });
});
