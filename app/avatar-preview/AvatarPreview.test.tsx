// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

const attach = () =>
    fireEvent.click(screen.getByRole("button", { name: /attach to profile/i }));

// The <img> src is resolved against the document base, so strip it back
// down to the bare blob: handle the registry knows.
const srcOf = (testId: string) =>
    (screen.getByTestId(testId) as HTMLImageElement).src.replace(
        window.location.href,
        ""
    );

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
        // Unmount while the stubs are still installed — an unmount-time
        // revoke must not hit a deleted URL.revokeObjectURL.
        cleanup();
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
        expect(alive.has(srcOf("preview"))).toBe(true);
    });

    it("keeps the attached thumbnail's URL alive while it is shown", () => {
        render(<AvatarPreview />);

        pick("one.png");
        attach();

        // A revoked blob URL renders as a broken image.
        expect(alive.has(srcOf("thumb"))).toBe(true);
    });

    it("keeps the attached thumbnail alive when the preview moves on", () => {
        render(<AvatarPreview />);

        pick("one.png");
        attach();
        const attached = srcOf("thumb");

        // The preview slot is replaced twice, but the thumbnail below it
        // still points at the URL from the first pick.
        pick("two.png");
        pick("three.png");

        expect(alive.has(attached)).toBe(true);
        expect(alive.has(srcOf("thumb"))).toBe(true);
        // Replacing the preview must still release the previews it drops.
        expect(alive.has(srcOf("preview"))).toBe(true);
        expect(alive.size).toBe(2);
    });

    it("releases the previous thumbnail when a new avatar is attached", () => {
        render(<AvatarPreview />);

        pick("one.png");
        attach();
        const firstThumb = srcOf("thumb");

        pick("two.png");
        attach();

        // Nothing displays the first avatar any more.
        expect(alive.has(firstThumb)).toBe(false);
        expect(alive.has(srcOf("thumb"))).toBe(true);
    });

    it("releases every outstanding URL when the component unmounts", () => {
        render(<AvatarPreview />);

        pick("one.png");
        attach();
        pick("two.png");

        cleanup();

        // The handles die with the component — nothing survives the tab
        // moving on to another page.
        expect([...alive]).toEqual([]);
    });

    it("shows a preview for a picked file", () => {
        render(<AvatarPreview />);

        pick("one.png");

        const preview = screen.getByTestId("preview") as HTMLImageElement;
        expect(preview.src).toContain("blob:avatar-");
        expect(alive.has(srcOf("preview"))).toBe(true);
    });
});
