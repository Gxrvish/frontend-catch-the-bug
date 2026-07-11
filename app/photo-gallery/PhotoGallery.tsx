"use client";

import { useRef, useState } from "react";

import { ConfirmDialog } from "./ConfirmDialog";
import { PHOTOS } from "./photoData";
import type { Photo } from "./photoGallery.types";

const PhotoCard = ({
    photo,
    onOpen,
    onDelete,
}: {
    photo: Photo;
    onOpen: (photo: Photo) => void;
    onDelete: (id: string) => void;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [confirming, setConfirming] = useState(false);

    return (
        <div
            ref={cardRef}
            data-testid="photo-card"
            onClick={() => onOpen(photo)}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-2 shadow-sm hover:border-indigo-300"
        >
            <div
                className={`h-24 rounded-lg bg-gradient-to-br ${photo.gradient}`}
            />
            <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-xs font-medium text-gray-800">
                    {photo.title}
                </p>
                <button
                    aria-label={`delete ${photo.title}`}
                    onClick={(e) => {
                        // This button sits inside the clickable card, so
                        // stop the click here before it opens the lightbox.
                        e.stopPropagation();
                        setConfirming(true);
                    }}
                    className="text-gray-400 hover:text-red-500"
                >
                    🗑
                </button>
            </div>
            {confirming && (
                // The dialog renders into document.body through a portal,
                // so its clicks never touch the card in the DOM — no need
                // for the stopPropagation trick in there.
                <ConfirmDialog
                    photo={photo}
                    containerRef={cardRef}
                    onCancel={() => setConfirming(false)}
                    onConfirm={() => {
                        setConfirming(false);
                        onDelete(photo.id);
                    }}
                />
            )}
        </div>
    );
};

export const PhotoGallery = () => {
    const [photos, setPhotos] = useState(PHOTOS);
    const [opened, setOpened] = useState<Photo | null>(null);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Field Trip Album
                </h2>
                <div
                    data-testid="photo-grid"
                    className="grid grid-cols-3 gap-3"
                >
                    {photos.map((photo) => (
                        <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onOpen={setOpened}
                            onDelete={(id) =>
                                setPhotos((prev) =>
                                    prev.filter((p) => p.id !== id)
                                )
                            }
                        />
                    ))}
                </div>
            </div>

            {opened && (
                <div
                    data-testid="lightbox"
                    className="fixed inset-0 z-10 flex items-center justify-center bg-black/70"
                >
                    <div className="rounded-xl bg-white p-6 text-center">
                        <div
                            className={`mx-auto h-40 w-64 rounded-lg bg-gradient-to-br ${opened.gradient}`}
                        />
                        <p className="mt-3 text-sm font-semibold text-gray-900">
                            {opened.title}
                        </p>
                        <button
                            aria-label="close lightbox"
                            onClick={() => setOpened(null)}
                            className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};
