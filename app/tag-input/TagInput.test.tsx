// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TagInput } from "./TagInput";

const draft = () => screen.getByTestId("draft") as HTMLInputElement;

describe("TagInput", () => {
    it("does not destroy text the user is composing", () => {
        render(<TagInput />);
        const input = draft();

        // A Japanese IME session: intermediate text arrives via change
        // events while the composition is open.
        fireEvent.compositionStart(input);
        fireEvent.change(input, { target: { value: "にほ" } });
        fireEvent.change(input, { target: { value: "日本" } });
        fireEvent.compositionEnd(input, { data: "日本" });

        expect(input.value).toBe("日本");
    });

    it("does not add a tag when Enter confirms the IME candidate", () => {
        render(<TagInput />);
        const input = draft();

        // Romaji stage of a Japanese IME session — the composition is
        // still open when Enter picks the candidate.
        fireEvent.compositionStart(input);
        fireEvent.change(input, { target: { value: "nihon" } });
        // Enter here confirms the IME candidate — it is not a submit.
        fireEvent.keyDown(input, { key: "Enter", isComposing: true });

        expect(screen.queryAllByTestId("tag")).toHaveLength(0);
    });

    it("adds a plain tag on Enter", () => {
        render(<TagInput />);
        const input = draft();

        fireEvent.change(input, { target: { value: "frontend" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(
            screen.getAllByTestId("tag").map((tag) => tag.textContent)
        ).toEqual(["frontend"]);
        expect(input.value).toBe("");
    });
});
