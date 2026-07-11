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
