export type Question = {
    id: string;
    prompt: string;
    choices: string[];
};

export const QUESTIONS: Question[] = [
    {
        id: "q-commute",
        prompt: "How do you usually get to the office?",
        choices: ["Bike", "Transit", "Car", "Walk"],
    },
    {
        id: "q-focus",
        prompt: "When are you most productive?",
        choices: ["Morning", "Afternoon", "Evening"],
    },
    {
        id: "q-snack",
        prompt: "Pick the next kitchen snack:",
        choices: ["Fruit", "Nuts", "Chocolate"],
    },
];

let buildCount = 0;

export const getBuildCount = () => buildCount;

export const _resetQuestionBank = () => {
    buildCount = 0;
};

// Precomputes the lookup used to resolve answers to questions. In
// production this walks a few thousand branching rules, so it is far
// too heavy to run more than once per session.
export const buildQuestionIndex = (): Map<string, Question> => {
    buildCount += 1;
    return new Map(QUESTIONS.map((question) => [question.id, question]));
};
