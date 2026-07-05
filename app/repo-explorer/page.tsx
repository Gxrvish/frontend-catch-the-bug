"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { RepoExplorer } from "./RepoExplorer";

const RepoExplorerPage = () => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <RepoExplorer />
        </QueryClientProvider>
    );
};

export default RepoExplorerPage;
