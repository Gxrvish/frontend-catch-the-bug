import { useState } from "react";

import type { ComposeMode, Conversation } from "./mailComposer.types";

const initialText = (conversation: Conversation, mode: ComposeMode) =>
    mode === "forward"
        ? `\n\n---------- Forwarded message ----------\nFrom: ${conversation.from}\n\n${conversation.body}`
        : "";

export const Composer = ({
    conversation,
    mode,
}: {
    conversation: Conversation;
    mode: ComposeMode;
}) => {
    const [text, setText] = useState(() => initialText(conversation, mode));

    const prefix = mode === "reply" ? "Re" : "Fwd";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p
                data-testid="composer-subject"
                className="mb-1 text-sm font-semibold text-gray-900"
            >
                {prefix}: {conversation.subject}
            </p>
            <p className="mb-3 text-xs text-gray-500">
                To: {conversation.from}
            </p>
            <textarea
                aria-label="message body"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder={
                    mode === "reply" ? "Write your reply…" : "Add a note…"
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button className="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                Send
            </button>
        </div>
    );
};
