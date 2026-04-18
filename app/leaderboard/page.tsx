"use client";

import { UserList } from "./UserList";
import { useSortedUsers } from "./useSortedUsers";
import { useUsers } from "./useUsers";

const Leaderboard = () => {
    const { users, loading } = useUsers();
    const sortedUsers = useSortedUsers(users);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Leaderboard
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Polling + live updates with intentionally tricky state flow.
                </p>
                {loading && (
                    <p className="mb-3 text-sm text-gray-500">Loading...</p>
                )}
                <UserList users={sortedUsers} />
            </div>
        </main>
    );
};

export default Leaderboard;
