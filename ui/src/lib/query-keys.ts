export const queryKeys = {
  programAccounts: (programId: string, endpoint: string) =>
    ["programAccounts", programId, endpoint] as const,

  account: (pubkey: string, endpoint: string) =>
    ["account", pubkey, endpoint] as const,

  accountWithChildren: (pubkey: string, endpoint: string, maxDepth: number) =>
    ["accountWithChildren", pubkey, endpoint, maxDepth] as const,
};
