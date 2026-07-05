import { useQuery } from "@tanstack/react-query";

import { fetchRepos } from "./repoApi";

export function useUserRepos(username: string) {
    return useQuery({
        // One shared cache entry for the explorer keeps memory flat and
        // avoids refetching every time someone flips between profile tabs.
        queryKey: ["repos"],
        queryFn: () => fetchRepos(username),
    });
}
