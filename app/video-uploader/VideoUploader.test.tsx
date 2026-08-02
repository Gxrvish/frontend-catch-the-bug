// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetUploadApi } from "./uploadApi";
import { VideoUploader } from "./VideoUploader";

const settle = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
    });
};

describe("VideoUploader", () => {
    beforeEach(() => {
        _resetUploadApi();
    });

    it("clears the failure banner after a successful retry", async () => {
        render(<VideoUploader />);

        fireEvent.click(screen.getByRole("button", { name: "Select clip" }));
        fireEvent.click(screen.getByRole("button", { name: "Upload" }));
        await settle();
        expect(screen.getByTestId("error-banner")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await settle();

        expect(screen.getByTestId("done-banner")).toBeInTheDocument();
        expect(screen.queryByTestId("error-banner")).not.toBeInTheDocument();
    });

    it("returns to an actionable state after cancelling", async () => {
        render(<VideoUploader />);

        fireEvent.click(screen.getByRole("button", { name: "Select clip" }));
        fireEvent.click(screen.getByRole("button", { name: "Upload" }));
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        await settle();

        expect(screen.queryByTestId("upload-spinner")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload" })).toBeEnabled();
    });

    it("shows at most one outcome at a time", async () => {
        render(<VideoUploader />);
        const exclusive = () =>
            [
                screen.queryByTestId("upload-spinner"),
                screen.queryByTestId("error-banner"),
                screen.queryByTestId("done-banner"),
            ].filter(Boolean).length;

        fireEvent.click(screen.getByRole("button", { name: "Select clip" }));
        fireEvent.click(screen.getByRole("button", { name: "Upload" }));
        expect(exclusive()).toBe(1);

        await settle();
        expect(exclusive()).toBe(1);
        expect(screen.getByTestId("error-banner")).toBeInTheDocument();

        // Retrying is in progress, not still failed.
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(exclusive()).toBe(1);
        expect(screen.queryByTestId("error-banner")).not.toBeInTheDocument();

        await settle();
        expect(exclusive()).toBe(1);
        expect(screen.getByTestId("done-banner")).toBeInTheDocument();
    });

    it("can upload again after a cancel", async () => {
        render(<VideoUploader />);

        fireEvent.click(screen.getByRole("button", { name: "Select clip" }));
        fireEvent.click(screen.getByRole("button", { name: "Upload" }));
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        await settle();

        fireEvent.click(screen.getByRole("button", { name: "Upload" }));
        await settle();

        // The cancelled attempt used up the transcoder's one failure, so
        // this one completes.
        expect(screen.getByTestId("done-banner")).toBeInTheDocument();
        expect(screen.queryByTestId("error-banner")).not.toBeInTheDocument();
        expect(screen.queryByTestId("upload-spinner")).not.toBeInTheDocument();
    });

    it("walks the happy path: fail once, retry to completion", async () => {
        render(<VideoUploader />);

        expect(screen.getByText("No clip selected")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload" })).toBeDisabled();

        fireEvent.click(screen.getByRole("button", { name: "Select clip" }));
        expect(screen.getByText("keynote-teaser.mp4")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Upload" }));
        await settle();
        expect(screen.getByTestId("error-banner")).toHaveTextContent(
            "transcoder unavailable"
        );

        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await settle();
        expect(screen.getByTestId("done-banner")).toHaveTextContent(
            "Upload complete"
        );
    });
});
