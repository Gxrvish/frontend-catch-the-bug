// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetPollApi, getSubmitted } from "./pollApi";
import { PollBooth } from "./PollBooth";

describe("PollBooth", () => {
    beforeEach(() => {
        _resetPollApi();
    });

    it("boost adds two votes", () => {
        render(<PollBooth />);

        fireEvent.click(screen.getByLabelText("boost Noodle Bar"));

        expect(screen.getByTestId("votes-noodle-bar")).toHaveTextContent(
            "2 votes"
        );
    });

    it("submits the tally including the vote just cast", () => {
        render(<PollBooth />);

        fireEvent.click(screen.getByLabelText("submit La Taqueria"));

        expect(screen.getByTestId("votes-taqueria")).toHaveTextContent(
            "1 votes"
        );
        expect(getSubmitted()).toEqual({ optionId: "taqueria", count: 1 });
    });

    it("keeps adding up across repeated boosts", () => {
        render(<PollBooth />);

        fireEvent.click(screen.getByLabelText("boost Noodle Bar"));
        fireEvent.click(screen.getByLabelText("boost Noodle Bar"));
        fireEvent.click(screen.getByLabelText("vote Noodle Bar"));

        expect(screen.getByTestId("votes-noodle-bar")).toHaveTextContent(
            "5 votes"
        );
        // Nobody else's tally moves.
        expect(screen.getByTestId("votes-taqueria")).toHaveTextContent(
            "0 votes"
        );
        expect(screen.getByTestId("votes-green-bowl")).toHaveTextContent(
            "0 votes"
        );
    });

    it("submits the count including everything cast before it", () => {
        render(<PollBooth />);

        fireEvent.click(screen.getByLabelText("vote La Taqueria"));
        fireEvent.click(screen.getByLabelText("boost La Taqueria"));
        fireEvent.click(screen.getByLabelText("submit La Taqueria"));

        expect(screen.getByTestId("votes-taqueria")).toHaveTextContent(
            "4 votes"
        );
        // What was reported has to be what is on screen.
        expect(getSubmitted()).toEqual({ optionId: "taqueria", count: 4 });
    });

    it("renders all options and counts single votes", () => {
        render(<PollBooth />);

        expect(screen.getByText("Noodle Bar")).toBeInTheDocument();
        expect(screen.getByText("La Taqueria")).toBeInTheDocument();
        expect(screen.getByText("Green Bowl")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("vote Green Bowl"));
        fireEvent.click(screen.getByLabelText("vote Green Bowl"));

        expect(screen.getByTestId("votes-green-bowl")).toHaveTextContent(
            "2 votes"
        );
    });
});
