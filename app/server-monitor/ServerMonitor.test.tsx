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

    it("follows the selection across repeated hotkey presses", () => {
        render(<ServerMonitor />);

        fireEvent.click(screen.getByRole("button", { name: /us-east-2/ }));
        fireEvent.keyDown(window, { key: "r" });
        fireEvent.click(screen.getByRole("button", { name: /ap-south-1/ }));
        fireEvent.keyDown(window, { key: "r" });
        fireEvent.click(screen.getByRole("button", { name: /eu-west-1/ }));
        fireEvent.keyDown(window, { key: "r" });

        expect(getRefreshLog()).toEqual([
            "us-east-2",
            "ap-south-1",
            "eu-west-1",
        ]);
    });

    it("ignores other keys and stops listening after unmount", () => {
        const { unmount } = render(<ServerMonitor />);

        fireEvent.keyDown(window, { key: "x" });
        expect(getRefreshLog()).toEqual([]);

        fireEvent.click(screen.getByRole("button", { name: /us-east-2/ }));
        fireEvent.keyDown(window, { key: "r" });
        expect(getRefreshLog()).toEqual(["us-east-2"]);

        unmount();
        fireEvent.keyDown(window, { key: "r" });

        // Re-subscribing per selection must still leave nothing behind.
        expect(getRefreshLog()).toEqual(["us-east-2"]);
    });

    it("keeps counting while the user is interacting", async () => {
        render(<ServerMonitor />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 450));
        });
        fireEvent.click(screen.getByRole("button", { name: /ap-south-1/ }));
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 450));
        });

        // Re-rendering for a selection must not restart or stall the clock.
        expect(
            Number(screen.getByTestId("uptime").textContent)
        ).toBeGreaterThanOrEqual(4);
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
