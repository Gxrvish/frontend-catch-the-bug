// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetAnalytics, getAnalyticsLog } from "./analytics";
import { _resetQuestionBank, getBuildCount } from "./questionBank";
import { SurveyRunner } from "./SurveyRunner";

describe("SurveyRunner", () => {
    beforeEach(() => {
        _resetAnalytics();
        _resetQuestionBank();
    });

    it("records exactly one analytics event per answer (StrictMode)", () => {
        render(
            <StrictMode>
                <SurveyRunner />
            </StrictMode>
        );

        fireEvent.click(screen.getByRole("button", { name: "Bike" }));

        expect(getAnalyticsLog()).toEqual(["q-commute"]);
    });

    it("builds the question index only once, even while typing notes", () => {
        render(<SurveyRunner />);

        const notes = screen.getByLabelText("notes");
        fireEvent.change(notes, { target: { value: "l" } });
        fireEvent.change(notes, { target: { value: "lo" } });
        fireEvent.change(notes, { target: { value: "lov" } });
        fireEvent.change(notes, { target: { value: "love" } });

        expect(getBuildCount()).toBe(1);
    });

    it("renders questions, marks answers, and summarizes them", () => {
        render(<SurveyRunner />);

        expect(
            screen.getByText("How do you usually get to the office?")
        ).toBeInTheDocument();
        expect(
            screen.getByText("When are you most productive?")
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Transit" }));
        expect(screen.getByRole("button", { name: "Transit" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );

        expect(screen.getByTestId("answer-summary")).toHaveTextContent(
            "How do you usually get to the office? — Transit"
        );

        fireEvent.change(screen.getByLabelText("notes"), {
            target: { value: "More plants please" },
        });
        expect(screen.getByLabelText("notes")).toHaveValue(
            "More plants please"
        );
    });
});
