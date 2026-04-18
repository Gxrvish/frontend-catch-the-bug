import type {
    LeaderboardAction,
    LeaderboardState,
    User,
} from "./leaderboard.types";

export const initialLeaderboardState: LeaderboardState = {
    users: {},
    loading: false,
};

// Intentionally buggy for the challenge: full fetch snapshots replace local state.
export const leaderboardReducer = (
    state: LeaderboardState,
    action: LeaderboardAction
): LeaderboardState => {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true };

        case "FETCH_SUCCESS": {
            const map: Record<string, User> = {};
            for (const u of action.payload) {
                map[u.id] = u;
            }
            return { users: map, loading: false };
        }

        case "UPDATE_USER":
            return {
                ...state,
                users: {
                    ...state.users,
                    [action.payload.id]: action.payload,
                },
            };

        default:
            return state;
    }
};
