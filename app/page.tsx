import Link from "next/link";

import { getProblemRoutes } from "./utils";

export default function Home() {
    const routes = getProblemRoutes();

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-10">
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Frontend Catch The Bug
                </h1>
                <p className="mb-6 text-sm text-gray-600">
                    Pick a problem route and start debugging.
                </p>

                {routes.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                        No problem routes found yet.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {routes.map((route) => (
                            <li key={route}>
                                <Link
                                    href={route}
                                    className="block rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                >
                                    {route}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
