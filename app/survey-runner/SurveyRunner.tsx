"use client";

import { useReducer, useState } from "react";

import { recordAnswer } from "./analytics";
import { buildQuestionIndex, QUESTIONS } from "./questionBank";

type AnswersState = Record<string, string>;

type AnswerAction = {
    type: "answer";
    questionId: string;
    choice: string;
};

const answersReducer = (
    state: AnswersState,
    action: AnswerAction
): AnswersState => {
    switch (action.type) {
        case "answer":
            // The reducer is the one funnel every answer passes through,
            // which makes it the perfect analytics hook.
            recordAnswer(action.questionId);
            return { ...state, [action.questionId]: action.choice };
    }
};

export const SurveyRunner = () => {
    const [answers, dispatch] = useReducer(answersReducer, {});
    // The initializer only runs on the first render, so the heavy index
    // build happens exactly once per session.
    const [index] = useState(buildQuestionIndex());
    const [notes, setNotes] = useState("");

    const answered = Object.entries(answers);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Office Pulse Survey
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Answered {answered.length} of {QUESTIONS.length}
                </p>

                <div className="space-y-3">
                    {QUESTIONS.map((question) => (
                        <div
                            key={question.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <p className="mb-2 text-sm font-medium text-gray-900">
                                {question.prompt}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {question.choices.map((choice) => (
                                    <button
                                        key={choice}
                                        aria-pressed={
                                            answers[question.id] === choice
                                        }
                                        onClick={() =>
                                            dispatch({
                                                type: "answer",
                                                questionId: question.id,
                                                choice,
                                            })
                                        }
                                        className={`rounded-lg border px-2 py-1 text-xs ${
                                            answers[question.id] === choice
                                                ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                                : "border-gray-300 bg-white text-gray-600"
                                        }`}
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {answered.length > 0 && (
                    <ul className="mt-4 space-y-1">
                        {answered.map(([questionId, choice]) => (
                            <li
                                key={questionId}
                                data-testid="answer-summary"
                                className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700"
                            >
                                {index.get(questionId)?.prompt} — {choice}
                            </li>
                        ))}
                    </ul>
                )}

                <label className="mt-4 block text-sm">
                    <span className="mb-1 block font-medium text-gray-700">
                        Anything else?
                    </span>
                    <textarea
                        aria-label="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                </label>
            </div>
        </main>
    );
};
