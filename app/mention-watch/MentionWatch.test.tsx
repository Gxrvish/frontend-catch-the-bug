// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MentionWatch } from "./MentionWatch";

const mentionCount = () =>
    Number(screen.getByTestId("mentions").textContent ?? "0");

describe("MentionWatch", () => {
    it("counts a mention arriving inside an existing message", async () => {
        render(<MentionWatch />);

        fireEvent.click(screen.getByRole("button", { name: /deliver one/i }));
        await waitFor(() => expect(mentionCount()).toBe(1));

        // The reply lands deep inside the first message's element, not as
        // a direct child of the transcript.
        fireEvent.click(screen.getByRole("button", { name: /reply/i }));

        await waitFor(() => expect(mentionCount()).toBe(2));
    });

    it("counts every message of a burst delivery", async () => {
        render(<MentionWatch />);

        fireEvent.click(screen.getByRole("button", { name: /deliver three/i }));

        await waitFor(() => expect(mentionCount()).toBe(3));
    });

    it("counts a single delivery once", async () => {
        render(<MentionWatch />);

        fireEvent.click(screen.getByRole("button", { name: /deliver one/i }));

        await waitFor(() => expect(mentionCount()).toBe(1));
        // Let any trailing observer callbacks land — the count must not
        // keep climbing.
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(mentionCount()).toBe(1);
    });
});
