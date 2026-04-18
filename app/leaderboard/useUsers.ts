import { useEffect, useReducer, useRef } from "react";

import { mockFetchUsers, mockUpdateUser } from "./leaderboardApi";
import {
    initialLeaderboardState,
    leaderboardReducer,
} from "./leaderboardReducer";

export const useUsers = () => {
    const [state, dispatch] = useReducer(
        leaderboardReducer,
        initialLeaderboardState
    );

    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            dispatch({ type: "FETCH_START" });
            const data = await mockFetchUsers();

            if (isMounted) {
                dispatch({ type: "FETCH_SUCCESS", payload: data });
            }
        };

        fetchData();
        intervalRef.current = window.setInterval(fetchData, 2000);

        return () => {
            isMounted = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const ids = Object.keys(state.users);
            if (ids.length === 0) {
                return;
            }

            const randomId = ids[Math.floor(Math.random() * ids.length)];

            mockUpdateUser(randomId).then((updatedUser) => {
                dispatch({ type: "UPDATE_USER", payload: updatedUser });
            });
        }, 300);

        return () => clearInterval(interval);
    }, [state.users]);

    return state;
};
