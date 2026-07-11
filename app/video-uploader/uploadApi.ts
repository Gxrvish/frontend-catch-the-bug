import type { UploadResult } from "./videoUploader.types";

// Deterministic transcoder stub: the first attempt of a session always
// fails with a 503, every attempt after that succeeds. This mirrors the
// staging transcoder's cold-start behavior and gives QA a reliable
// error-path reproduction.
let attempts = 0;

export const getAttempts = () => attempts;

export const _resetUploadApi = () => {
    attempts = 0;
};

export const startUpload = async (fileName: string): Promise<UploadResult> => {
    attempts += 1;
    const attempt = attempts;
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (attempt === 1) {
        throw new Error("503: transcoder unavailable");
    }
    return { url: `https://cdn.example.com/clips/${fileName}` };
};
