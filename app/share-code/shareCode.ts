export type InviteState = {
    team: string;
    seats: number;
};

/** Pack the invite into a compact code for links and QR badges. */
export const encodeInvite = (state: InviteState): string =>
    btoa(JSON.stringify(state));

/** Unpack a code back into the invite. */
export const decodeInvite = (code: string): InviteState =>
    JSON.parse(atob(code)) as InviteState;

/** The shareable link: the code rides in the query string. */
export const inviteUrl = (state: InviteState): string =>
    `https://app.example.com/join?invite=${encodeInvite(state)}`;

/** What the join page does with an incoming link. */
export const inviteFromUrl = (url: string): InviteState => {
    const query = url.split("?")[1] ?? "";
    const code = new URLSearchParams(query).get("invite") ?? "";
    return decodeInvite(code);
};
