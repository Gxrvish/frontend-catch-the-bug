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
