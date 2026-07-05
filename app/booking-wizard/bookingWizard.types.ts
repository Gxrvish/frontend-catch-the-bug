export interface BookingDetails {
    guestName: string;
    email: string;
    guests: number;
    checkIn: string;
    checkOut: string;
}

export interface BookingConfirmation {
    confirmationId: string;
    guestName: string;
}

export type WizardStepId = "guest-info" | "stay-dates" | "review";
