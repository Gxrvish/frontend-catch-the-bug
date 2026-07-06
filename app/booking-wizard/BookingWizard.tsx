"use client";

import { useState } from "react";

import { submitBooking } from "./bookingApi";
import type { BookingDetails, WizardStepId } from "./bookingWizard.types";

const STEPS: { id: WizardStepId; label: string }[] = [
    { id: "guest-info", label: "Guest info" },
    { id: "stay-dates", label: "Stay dates" },
    { id: "review", label: "Review" },
];

const INITIAL_DETAILS: BookingDetails = {
    guestName: "",
    email: "",
    guests: 2,
    checkIn: "2026-08-14",
    checkOut: "2026-08-18",
};

const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-500";

export const BookingWizard = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [details, setDetails] = useState<BookingDetails>(INITIAL_DETAILS);
    const [confirmationId, setConfirmationId] = useState<string | null>(null);

    const patch = (partial: Partial<BookingDetails>) =>
        setDetails((prev) => ({ ...prev, ...partial }));

    const stepBodies = [
        <GuestInfoStep key={1} details={details} patch={patch} />,
        <StayDatesStep key={2} details={details} patch={patch} />,
        <ReviewStep
            key={3}
            details={details}
            confirmationId={confirmationId}
            setConfirmationId={setConfirmationId}
        />,
    ];
    const CurrentStep = stepBodies[stepIndex];

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Booking Wizard
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Try typing your full name in one go on the first step.
                </p>

                <ol className="mb-4 flex gap-2">
                    {STEPS.map((step, i) => (
                        <li
                            key={step.id}
                            className={`flex-1 rounded-full px-3 py-1 text-center text-xs font-medium ${
                                i === stepIndex
                                    ? "bg-rose-600 text-white"
                                    : i < stepIndex
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-white text-gray-500"
                            }`}
                        >
                            {step.label}
                        </li>
                    ))}
                </ol>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {CurrentStep}

                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={() =>
                                setStepIndex((i) => Math.max(0, i - 1))
                            }
                            disabled={stepIndex === 0}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
                        >
                            Back
                        </button>
                        <button
                            onClick={() =>
                                setStepIndex((i) =>
                                    Math.min(STEPS.length - 1, i + 1)
                                )
                            }
                            disabled={stepIndex === STEPS.length - 1}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

const GuestInfoStep = ({
    details,
    patch,
}: {
    details: BookingDetails;
    patch: (o: object) => void;
}) => (
    <div className="space-y-3">
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
                Full name
            </label>
            <input
                aria-label="guest name"
                value={details.guestName}
                onChange={(e) => patch({ guestName: e.target.value })}
                placeholder="Jane Doe"
                className={inputClass}
            />
        </div>
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
                Email
            </label>
            <input
                aria-label="guest email"
                value={details.email}
                onChange={(e) => patch({ email: e.target.value })}
                placeholder="jane@example.com"
                className={inputClass}
            />
        </div>
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
                Guests
            </label>
            <select
                aria-label="guest count"
                value={details.guests}
                onChange={(e) => patch({ guests: Number(e.target.value) })}
                className={inputClass}
            >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

const StayDatesStep = ({
    details,
    patch,
}: {
    details: BookingDetails;
    patch: (o: object) => void;
}) => (
    <div className="space-y-3">
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
                Check-in
            </label>
            <input
                aria-label="check-in date"
                type="date"
                value={details.checkIn}
                onChange={(e) => patch({ checkIn: e.target.value })}
                className={inputClass}
            />
        </div>
        <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
                Check-out
            </label>
            <input
                aria-label="check-out date"
                type="date"
                value={details.checkOut}
                onChange={(e) => patch({ checkOut: e.target.value })}
                className={inputClass}
            />
        </div>
    </div>
);

const ReviewStep = ({
    details,
    confirmationId,
    setConfirmationId,
}: {
    details: BookingDetails;
    confirmationId: string | null;
    setConfirmationId: (s: string) => void;
}) => (
    <div className="space-y-2 text-sm text-gray-800">
        <p>
            <span className="font-medium">Guest:</span>{" "}
            {details.guestName || "—"} ({details.email || "no email"})
        </p>
        <p>
            <span className="font-medium">Party:</span> {details.guests} guests
        </p>
        <p>
            <span className="font-medium">Stay:</span> {details.checkIn} →{" "}
            {details.checkOut}
        </p>
        {confirmationId ? (
            <p
                data-testid="confirmation"
                className="rounded-lg bg-green-50 px-3 py-2 text-green-700"
            >
                Booked! Confirmation {confirmationId}
            </p>
        ) : (
            <button
                onClick={() => {
                    void submitBooking(details).then((c) =>
                        setConfirmationId(c.confirmationId)
                    );
                }}
                className="w-full rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700"
            >
                Confirm booking
            </button>
        )}
    </div>
);
