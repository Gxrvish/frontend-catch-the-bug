// Layout telemetry — panels register their root element so the
// measurement service can observe size changes. Registrations are
// counted because each one costs an observer slot in production.
const activeElements = new Set<Element>();
let registrationCount = 0;

export const trackElement = (element: Element) => {
    registrationCount += 1;
    activeElements.add(element);
};

export const untrackElement = (element: Element) => {
    activeElements.delete(element);
};

export const getRegistrationCount = () => registrationCount;
export const getActiveTrackerCount = () => activeElements.size;

export const _resetElementTracker = () => {
    activeElements.clear();
    registrationCount = 0;
};
