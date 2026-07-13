// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AvatarPreview } from "./AvatarPreview";

// jsdom ships no object-URL implementation — this registry is both the
// stub and the leak detector.
const alive = new Set<string>();
let nextUrl = 1;

const pick = (name: string) => {
    const file = new File(["img-bytes"], name, { type: "image/png" });
    fireEvent.change(screen.getByTestId("picker"), {
        target: { files: [file] },
    });
};

describe("AvatarPreview", () => {
    beforeEach(() => {
        alive.clear();
        nextUrl = 1;
        URL.createObjectURL = () => {
            const url = `blob:avatar-${nextUrl++}`;
            alive.add(url);
            return url;
        };
        URL.revokeObjectURL = (url: string) => {
            alive.delete(url);
        };
    });

    afterEach(() => {
        delete (URL as { createObjectURL?: unknown }).createObjectURL;
        delete (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
    });

    it("releases the old preview when a new file is picked", () => {
        render(<AvatarPreview />);

        pick("one.png");
        pick("two.png");
        pick("three.png");

        // Only the URL backing the current preview may stay alive.
        expect(alive.size).toBe(1);
        const preview = screen.getByTestId("preview") as HTMLImageElement;
        expect(alive.has(preview.src.replace(window.location.href, ""))).toBe(
            true
        );
    });

    it("keeps the attached thumbnail's URL alive while it is shown", () => {
        render(<AvatarPreview />);

        pick("one.png");
        fireEvent.click(
            screen.getByRole("button", { name: /attach to profile/i })
        );

        const thumb = screen.getByTestId("thumb") as HTMLImageElement;
        const url = thumb.src.replace(window.location.href, "");
        // A revoked blob URL renders as a broken image.
        expect(alive.has(url)).toBe(true);
    });

    it("shows a preview for a picked file", () => {
        render(<AvatarPreview />);

        pick("one.png");

        const preview = screen.getByTestId("preview") as HTMLImageElement;
        expect(preview.src).toContain("blob:avatar-");
    });
});
