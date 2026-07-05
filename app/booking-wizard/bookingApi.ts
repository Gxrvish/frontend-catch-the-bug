import type {
    BookingConfirmation,
    BookingDetails,
} from "./bookingWizard.types";

/**
 * Simulated reservation service. Latency is realistic but nothing here is
 * part of the bug — the wizard misbehaves long before submission.
 */
export const submitBooking = (
    details: BookingDetails
): Promise<BookingConfirmation> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                confirmationId: `BK-${Math.random()
                    .toString(36)
                    .slice(2, 8)
                    .toUpperCase()}`,
                guestName: details.guestName,
            });
        }, 400);
    });
