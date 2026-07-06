export type JoinResult =
    | { ok: true; position: number }
    | { ok: false; error: string };
