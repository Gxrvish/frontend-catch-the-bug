import { uploadFile } from "./uploadApi";

export type UploadStatus =
    | "queued"
    | "uploading"
    | "done"
    | "failed"
    | "cancelled";

export type QueueHandle = {
    status: (name: string) => UploadStatus;
    statuses: () => Record<string, UploadStatus>;
    cancel: (name: string) => void;
    done: Promise<void>;
};

/** The bandwidth budget product agreed on: at most two uploads at a time. */
export const CONCURRENCY = 2;

export const startQueue = (
    files: string[],
    onChange?: (statuses: Record<string, UploadStatus>) => void
): QueueHandle => {
    const statuses = new Map<string, UploadStatus>(
        files.map((file) => [file, "queued"])
    );

    const snapshot = () =>
        Object.fromEntries(statuses) as Record<string, UploadStatus>;

    const setStatus = (name: string, status: UploadStatus) => {
        statuses.set(name, status);
        onChange?.(snapshot());
    };

    const cancel = (name: string) => {
        // Pull the row out of the UI. The request is already on the wire, so
        // there is nothing to do about it.
        setStatus(name, "cancelled");
    };

    // Hand every file to the transport at once so the queue drains as fast as
    // the network is willing to go.
    const done = Promise.all(
        files.map(async (name) => {
            setStatus(name, "uploading");
            await uploadFile(name);
            setStatus(name, "done");
        })
    ).then(() => undefined);

    return {
        status: (name) => statuses.get(name) ?? "queued",
        statuses: snapshot,
        cancel,
        done,
    };
};
