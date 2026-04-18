import ActivityFeed from "./ActivityFeed";

export default function ActivityFeedPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h1 className="mb-2 text-xl font-semibold text-gray-900">
                    Activity Feed Playground
                </h1>
                <p className="mb-6 text-sm text-gray-600">
                    Polling + optimistic updates with intentionally tricky race
                    conditions.
                </p>
                <ActivityFeed />
            </div>
        </main>
    );
}
