import { memo, useCallback } from "react";

import type { User } from "./leaderboard.types";

interface UserListProps {
    users: User[];
}

const UserListComponent = ({ users }: UserListProps) => {
    const renderItem = useCallback((user: User) => {
        return (
            <div
                key={user.id}
                style={{
                    padding: "8px",
                    borderBottom: "1px solid #eee",
                }}
            >
                {user.name} - {user.score}
            </div>
        );
    }, []);

    return <div>{users.map(renderItem)}</div>;
};

export const UserList = memo(UserListComponent);
