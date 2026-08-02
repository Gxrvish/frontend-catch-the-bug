// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
    _resetSettingsApi,
    getServerSettings,
    TEAMMATE_WEBHOOK,
} from "./settingsApi";
import { TeamSettingsForm } from "./TeamSettingsForm";

const settle = () =>
    act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
    });

describe("TeamSettingsForm", () => {
    beforeEach(() => {
        _resetSettingsApi();
    });

    it("does not silently overwrite a concurrent edit", async () => {
        render(<TeamSettingsForm />);
        expect(
            await screen.findByDisplayValue("Platform Guild")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Simulate teammate edit (other tab)",
            })
        );
        fireEvent.change(screen.getByLabelText("team name"), {
            target: { value: "Platform Guild EU" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
        await settle();

        expect(getServerSettings().webhookUrl).toBe(TEAMMATE_WEBHOOK);
    });

    it("does not claim success, or land anything, on a conflict", async () => {
        render(<TeamSettingsForm />);
        await screen.findByDisplayValue("Platform Guild");

        fireEvent.click(
            screen.getByRole("button", {
                name: "Simulate teammate edit (other tab)",
            })
        );
        fireEvent.change(screen.getByLabelText("team name"), {
            target: { value: "Platform Guild EU" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
        await settle();

        const server = getServerSettings();
        expect(server.webhookUrl).toBe(TEAMMATE_WEBHOOK);
        // Not partially applied either — the write was rejected whole.
        expect(server.teamName).toBe("Platform Guild");
        expect(server.version).toBe(2);
        expect(screen.queryByTestId("save-success")).not.toBeInTheDocument();
    });

    it("keeps the version honest across repeated saves", async () => {
        render(<TeamSettingsForm />);
        await screen.findByDisplayValue("Platform Guild");
        const name = screen.getByLabelText("team name");
        const save = screen.getByRole("button", { name: "Save settings" });

        fireEvent.change(name, { target: { value: "Crew A" } });
        fireEvent.click(save);
        await settle();
        expect(getServerSettings().version).toBe(2);

        fireEvent.change(name, { target: { value: "Crew B" } });
        fireEvent.click(save);
        await settle();
        expect(getServerSettings().version).toBe(3);
        expect(getServerSettings().teamName).toBe("Crew B");

        fireEvent.click(
            screen.getByRole("button", {
                name: "Simulate teammate edit (other tab)",
            })
        );
        fireEvent.change(name, { target: { value: "Crew C" } });
        fireEvent.click(save);
        await settle();

        // The teammate's bump stands; the third save does not.
        const server = getServerSettings();
        expect(server.version).toBe(4);
        expect(server.teamName).toBe("Crew B");
        expect(server.webhookUrl).toBe(TEAMMATE_WEBHOOK);
    });

    it("saves normally when nobody else edited in between", async () => {
        render(<TeamSettingsForm />);
        expect(
            await screen.findByDisplayValue("Platform Guild")
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("team name"), {
            target: { value: "Platform Crew" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

        expect(await screen.findByTestId("save-success")).toBeInTheDocument();
        const server = getServerSettings();
        expect(server.teamName).toBe("Platform Crew");
        expect(server.webhookUrl).toBe("https://hooks.example.com/platform");
        expect(server.version).toBe(2);
    });
});
