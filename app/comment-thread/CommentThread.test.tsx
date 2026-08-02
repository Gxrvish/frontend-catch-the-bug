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

const post = (text: string) => {
    fireEvent.change(screen.getByLabelText("write a comment"), {
        target: { value: text },
    });
    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));
};

const rows = () => screen.getByTestId("comment-list").children.length;

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

    it("shows the comment optimistically before taking it back", async () => {
        render(<CommentThread />);

        post("totally spam offer");

        // Waiting for the server before showing anything would also pass
        // the rollback test — and lose the feature.
        expect(screen.getByText(/totally spam offer/)).toBeInTheDocument();

        await settle();

        expect(
            screen.queryByText(/totally spam offer/)
        ).not.toBeInTheDocument();
        expect(screen.getByTestId("post-error")).toBeInTheDocument();
    });

    it("keeps earlier comments when a later one is rejected", async () => {
        render(<CommentThread />);

        post("Great mix, saved it");
        await settle();
        expect(screen.getAllByText(/Great mix, saved it/)).toHaveLength(1);

        post("totally spam offer");
        await settle();

        // Rolling back to the seed, or dropping the last row blindly, is
        // not a rollback of *this* post.
        expect(
            screen.queryByText(/totally spam offer/)
        ).not.toBeInTheDocument();
        expect(screen.getAllByText(/Great mix, saved it/)).toHaveLength(1);
        expect(screen.getByText(/This mix is incredible/)).toBeInTheDocument();
        expect(rows()).toBe(3);
    });

    it("rolls back only the rejected post when several are in flight", async () => {
        render(<CommentThread />);

        post("first one through");
        post("totally spam offer");
        post("third one through");

        await settle();

        expect(screen.getAllByText(/first one through/)).toHaveLength(1);
        expect(screen.getAllByText(/third one through/)).toHaveLength(1);
        expect(
            screen.queryByText(/totally spam offer/)
        ).not.toBeInTheDocument();
        expect(screen.getByTestId("post-error")).toBeInTheDocument();
        expect(rows()).toBe(4);
    });

    it("recovers cleanly after a rejection", async () => {
        render(<CommentThread />);

        post("totally spam offer");
        await settle();
        expect(screen.getByTestId("post-error")).toBeInTheDocument();

        post("a perfectly fine take");
        await settle();

        expect(screen.getAllByText(/a perfectly fine take/)).toHaveLength(1);
        expect(
            screen.queryByText(/totally spam offer/)
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId("post-error")).not.toBeInTheDocument();
        expect(rows()).toBe(3);
    });

    it("ignores an empty draft and still rolls back a rejected one", async () => {
        render(<CommentThread />);

        post("   ");
        await settle();
        expect(rows()).toBe(2);

        post("totally spam offer");
        await settle();

        expect(rows()).toBe(2);
        expect(screen.getByTestId("post-error")).toBeInTheDocument();
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
