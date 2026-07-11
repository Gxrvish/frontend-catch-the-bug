import { type RefObject, useEffect } from "react";
import { createPortal } from "react-dom";

import type { Photo } from "./photoGallery.types";

export const ConfirmDialog = ({
    photo,
    containerRef,
    onCancel,
    onConfirm,
}: {
    photo: Photo;
    containerRef: RefObject<HTMLDivElement | null>;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            // Everything this card renders lives inside its DOM subtree,
            // so a click outside that subtree means "dismiss the dialog".
            if (!containerRef.current?.contains(event.target as Node)) {
                onCancel();
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [containerRef, onCancel]);

    return createPortal(
        <div
            data-testid="confirm-dialog"
            className="fixed inset-x-0 top-24 z-20 mx-auto w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
        >
            <p className="text-sm font-semibold text-gray-900">
                Delete this photo?
            </p>
            <p className="mt-1 text-xs text-gray-600">
                “{photo.title}” will be removed from the album.
            </p>
            <div className="mt-3 flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </div>,
        document.body
    );
};
