import type { Dispatch, SetStateAction } from "react";

export type StudioUser = {
    name: string;
    role: string;
};

export type StudioContextValue = {
    user: StudioUser;
    zoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
};
