export const SERVERS = ["eu-west-1", "us-east-2", "ap-south-1"] as const;

export type ServerId = (typeof SERVERS)[number];

// Ops audit trail — every refresh request lands here so QA can verify
// exactly which server a given interaction targeted.
let refreshLog: ServerId[] = [];

export const refreshServer = (id: ServerId) => {
    refreshLog.push(id);
};

export const getRefreshLog = () => [...refreshLog];

export const _resetMonitorApi = () => {
    refreshLog = [];
};
