"use client";

import { useUser } from "./useUser";

const ProfileHeader = () => {
    const user = useUser("u-1");

    return (
        <header
            data-testid="profile-header"
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
            <h2 className="text-lg font-semibold text-gray-900">
                {user ? user.name : "Loading…"}
            </h2>
            <p className="text-sm text-gray-600">{user?.email ?? "—"}</p>
        </header>
    );
};

const PlanSidebar = () => {
    const user = useUser("u-1");

    return (
        <aside
            data-testid="plan-sidebar"
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
            <h3 className="mb-1 text-sm font-semibold text-gray-800">
                Current plan
            </h3>
            <p className="text-sm text-gray-700">
                {user ? user.plan : "Loading…"}
            </p>
        </aside>
    );
};

const BillingPanel = () => {
    const user = useUser("u-1");

    return (
        <section
            data-testid="billing-panel"
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
            <h3 className="mb-1 text-sm font-semibold text-gray-800">
                Billing
            </h3>
            <p className="text-sm text-gray-700">
                {user ? `Card ending in ${user.cardLast4}` : "Loading…"}
            </p>
        </section>
    );
};

export const ProfilePage = () => (
    <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-2xl space-y-4">
            <ProfileHeader />
            <div className="grid grid-cols-2 gap-4">
                <PlanSidebar />
                <BillingPanel />
            </div>
        </div>
    </main>
);
