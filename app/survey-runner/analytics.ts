// Product analytics stub — every recorded answer lands here so QA can
// compare what the funnel reports against what the user actually did.
let answerLog: string[] = [];

export const recordAnswer = (questionId: string) => {
    answerLog.push(questionId);
};

export const getAnalyticsLog = () => [...answerLog];

export const _resetAnalytics = () => {
    answerLog = [];
};
