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

    it("leaves what the user typed alone and normalizes at add time", () => {
        render(<TagInput />);
        const input = draft();

        fireEvent.change(input, { target: { value: "Front End!" } });

        // The field shows what was typed…
        expect(input.value).toBe("Front End!");

        fireEvent.keyDown(input, { key: "Enter" });

        // …and the tag that lands is still a slug. Deleting the
        // normalisation is not the fix.
        const tags = screen.getAllByTestId("tag").map((tag) => tag.textContent);
        expect(tags).toHaveLength(1);
        expect(tags[0]).toMatch(/^[a-z0-9-]+$/);
    });

    it("adds the tag once the composition has ended", () => {
        render(<TagInput />);
        const input = draft();

        fireEvent.compositionStart(input);
        fireEvent.change(input, { target: { value: "nihon" } });
        fireEvent.keyDown(input, { key: "Enter", isComposing: true });
        expect(screen.queryAllByTestId("tag")).toHaveLength(0);

        fireEvent.compositionEnd(input, { data: "nihon" });
        fireEvent.keyDown(input, { key: "Enter" });

        // Standing down during composition must not mean standing down
        // afterwards.
        expect(
            screen.getAllByTestId("tag").map((tag) => tag.textContent)
        ).toEqual(["nihon"]);
        expect(input.value).toBe("");

        // And a bare Enter on an empty field still adds nothing.
        fireEvent.keyDown(input, { key: "Enter" });
        expect(screen.getAllByTestId("tag")).toHaveLength(1);
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
