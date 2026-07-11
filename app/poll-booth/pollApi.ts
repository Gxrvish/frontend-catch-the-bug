export type TallyPayload = {
    optionId: string;
    count: number;
};

// The tally service keeps only the latest submission per session — QA
// inspects it to check exactly what count the client reported.
let submitted: TallyPayload | null = null;

export const submitTally = (optionId: string, count: number) => {
    submitted = { optionId, count };
};

export const getSubmitted = () => submitted;

export const _resetPollApi = () => {
    submitted = null;
};
