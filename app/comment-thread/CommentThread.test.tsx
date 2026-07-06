// @vitest-environment jsdom
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommentThread } from "./CommentThread";

const settle = () =>
    act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
    });

describe("CommentThread", () => {
    it("removes the optimistic comment when the server rejects it", async () => {
        render(<CommentThread />);

        fireEvent.change(screen.getByLabelText("write a comment"), {
            target: { value: "totally spam offer" },
        });
        fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

        expect(
            await screen.findByText("Comment rejected by moderation.")
        ).toBeInTheDocument();

        // The rejected comment must not linger in the thread as a ghost.
        expect(
            screen.queryByText(/totally spam offer/)
        ).not.toBeInTheDocument();
    });

    it("shows a successful comment exactly once after it saves", async () => {
        render(<CommentThread />);

        fireEvent.change(screen.getByLabelText("write a comment"), {
            target: { value: "Adding this to my morning queue" },
        });
        fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

        await waitFor(() =>
            expect(
                screen.getAllByText(/Adding this to my morning queue/)
            ).toHaveLength(1)
        );
        await settle();

        expect(
            screen.getAllByText(/Adding this to my morning queue/)
        ).toHaveLength(1);
        expect(screen.queryByTestId("post-error")).not.toBeInTheDocument();
    });
});
