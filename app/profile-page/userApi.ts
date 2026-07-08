import type { UserAccount } from "./profilePage.types";

const USER: UserAccount = {
    id: "u-1",
    name: "Ada Moreno",
    email: "ada@example.com",
    plan: "Pro (annual)",
    cardLast4: "4242",
};

let callCount = 0;

export const fetchUser = async (id: string): Promise<UserAccount> => {
    callCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (id !== USER.id) {
        throw new Error(`Unknown user: ${id}`);
    }
    return { ...USER };
};

export const getCallCount = () => callCount;

export const _resetUserApi = () => {
    callCount = 0;
};
