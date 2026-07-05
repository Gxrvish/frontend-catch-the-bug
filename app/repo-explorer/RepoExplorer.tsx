"use client";

import { useState } from "react";

import { USERS } from "./repoApi";
import { useUserRepos } from "./useUserRepos";

export const RepoExplorer = () => {
    const [username, setUsername] = useState(USERS[0].username);

    const { data: repos, isPending, isFetching } = useUserRepos(username);

    const profile = USERS.find((u) => u.username === username) ?? USERS[0];

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Repo Explorer
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Switch between profiles and check whose repos you are
                    looking at.
                </p>

                <div className="mb-4 flex gap-2">
                    {USERS.map((user) => (
                        <button
                            key={user.username}
                            onClick={() => setUsername(user.username)}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                user.username === username
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            @{user.username}
                        </button>
                    ))}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3
                            data-testid="profile-header"
                            className="text-sm font-semibold text-gray-900"
                        >
                            @{profile.username} — {profile.displayName}
                        </h3>
                        {isFetching && (
                            <span className="text-xs text-gray-400">
                                refreshing…
                            </span>
                        )}
                    </div>

                    {isPending ? (
                        <p className="text-sm text-gray-500">Loading repos…</p>
                    ) : (
                        <ul data-testid="repo-list" className="space-y-2">
                            {(repos ?? []).map((repo) => (
                                <li
                                    key={repo.name}
                                    className="rounded-lg bg-gray-50 px-3 py-2"
                                >
                                    <span className="block text-sm font-medium text-gray-900">
                                        {repo.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {repo.description} · {repo.language} · ★{" "}
                                        {repo.stars.toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    );
};
