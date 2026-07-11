// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetMonitorApi, getRefreshLog } from "./monitorApi";
import { ServerMonitor } from "./ServerMonitor";

describe("ServerMonitor", () => {
    beforeEach(() => {
        _resetMonitorApi();
    });

    it("keeps counting uptime past the first tick", async () => {
        render(<ServerMonitor />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 650));
        });

        const uptime = Number(screen.getByTestId("uptime").textContent);
        expect(uptime).toBeGreaterThanOrEqual(2);
    });

    it("refreshes the currently selected server via the hotkey", () => {
        render(<ServerMonitor />);

        fireEvent.click(screen.getByRole("button", { name: /us-east-2/ }));
        fireEvent.keyDown(window, { key: "r" });

        expect(getRefreshLog()).toEqual(["us-east-2"]);
    });

    it("lists servers, tracks selection, and refreshes via the button", () => {
        render(<ServerMonitor />);

        expect(
            screen.getByRole("button", { name: /eu-west-1/ })
        ).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(screen.getByRole("button", { name: /ap-south-1/ }));
        expect(
            screen.getByRole("button", { name: /ap-south-1/ })
        ).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(
            screen.getByRole("button", { name: "Refresh selected" })
        );
        expect(getRefreshLog()).toEqual(["ap-south-1"]);
    });
});
