import NotificationCenter from "./NotificationCenter";

export default function NotificationPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-xl mx-auto rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900 mb-4">
                    Notification Playground :)
                </h1>
                <p className="text-sm text-gray-600 mb-6">
                    Open the bell icon to see polling, optimistic updates, and
                    filters in action.
                </p>
                <div className="flex justify-end">
                    <NotificationCenter pollIntervalMs={3000} />
                </div>
            </div>
        </main>
    );
}
