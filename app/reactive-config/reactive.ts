export type ChangeListener = (path: string) => void;

/**
 * Wrap a config object so every write notifies the listener — the
 * autosave layer and the "unsaved changes" badge both hang off it.
 */
export const createReactive = <T extends object>(
    target: T,
    onChange: ChangeListener
): T =>
    new Proxy(target, {
        // Every mutation funnels through set — that's the whole trick.
        set(obj, key, value) {
            Reflect.set(obj, key, value);
            onChange(String(key));
            return true;
        },
    });
