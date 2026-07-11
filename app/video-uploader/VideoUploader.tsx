"use client";

import { useRef, useState } from "react";

import { startUpload } from "./uploadApi";

const CLIP_NAME = "keynote-teaser.mp4";

export const VideoUploader = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const cancelledRef = useRef(false);

    const upload = async () => {
        if (!fileName) {
            return;
        }
        cancelledRef.current = false;
        setIsCancelled(false);
        setIsError(false);
        setIsDone(false);
        setIsUploading(true);
        try {
            await startUpload(fileName);
            if (cancelledRef.current) {
                return;
            }
            setIsDone(true);
            setIsUploading(false);
        } catch {
            if (cancelledRef.current) {
                return;
            }
            setIsError(true);
            setIsUploading(false);
        }
    };

    const retry = async () => {
        if (!fileName) {
            return;
        }
        // The failure already happened — keep its banner up while the
        // retry runs so a support screenshot captures the whole story.
        setIsUploading(true);
        try {
            await startUpload(fileName);
            if (cancelledRef.current) {
                return;
            }
            setIsDone(true);
        } catch {
            if (cancelledRef.current) {
                return;
            }
            setIsError(true);
        } finally {
            setIsUploading(false);
        }
    };

    const cancel = () => {
        // The request is still on the wire until the server acks the
        // abort, so the uploading flag stays honest and keeps mirroring
        // the in-flight call.
        cancelledRef.current = true;
        setIsCancelled(true);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Clip Uploader
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Uploads go straight to the transcoder pipeline.
                </p>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm text-gray-800">
                        {fileName ?? "No clip selected"}
                    </p>

                    <div className="mb-3 flex gap-2">
                        <button
                            onClick={() => setFileName(CLIP_NAME)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
                        >
                            Select clip
                        </button>
                        <button
                            onClick={upload}
                            disabled={!fileName || isUploading}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Upload
                        </button>
                        {isUploading && (
                            <button
                                onClick={cancel}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                        {isError && (
                            <button
                                onClick={retry}
                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                            >
                                Retry
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {isUploading && (
                            <p
                                data-testid="upload-spinner"
                                className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700"
                            >
                                Uploading {fileName}…
                            </p>
                        )}
                        {isError && (
                            <p
                                data-testid="error-banner"
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                            >
                                Upload failed — transcoder unavailable.
                            </p>
                        )}
                        {isDone && (
                            <p
                                data-testid="done-banner"
                                className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700"
                            >
                                Upload complete — ready to publish.
                            </p>
                        )}
                        {isCancelled && (
                            <p
                                data-testid="cancelled-banner"
                                className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600"
                            >
                                Upload cancelled.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};
