import { useEffect, useState } from "react";

import type { UserAccount } from "./profilePage.types";
import { fetchUser } from "./userApi";

// Each widget owns its own data fetch — no shared cache to invalidate, and
// every widget keeps working when dropped onto another page on its own.
export const useUser = (id: string) => {
    const [user, setUser] = useState<UserAccount | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchUser(id).then((data) => {
            if (!cancelled) {
                setUser(data);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    return user;
};
