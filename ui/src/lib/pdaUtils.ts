import type { ModIdlAccount } from "./types";

export const isAccountPda = (account: ModIdlAccount) => {
  return account.pda !== undefined;
};

export const isPdaAutoDerivable = (account: ModIdlAccount) => {
  if (!isAccountPda(account)) return false;
  const seeds = account.pda?.seeds;
  return seeds ? seeds.length > 0 : false;
};

export const isPdaComplexToDerive = (account: ModIdlAccount) => {
  if (!isAccountPda(account)) return false;
  const seeds = account.pda?.seeds;
  return seeds
    ? seeds.some((seed) => seed.kind === "account" && seed.account)
    : false;
};

// NEW: Get human-readable dependencies
export const getPDADependencies = (account: ModIdlAccount) => {
  if (!isAccountPda(account)) return { args: [], accounts: [], complex: [] };

  const seeds = account.pda?.seeds || [];
  const args: string[] = [];
  const accounts: string[] = [];
  const complex: string[] = [];

  seeds.forEach((seed) => {
    if (seed.kind === "arg" && seed.path) {
      args.push(seed.path);
    } else if (seed.kind === "account") {
      if (seed.account) {
        // Complex: depends on account field
        complex.push(seed.path || "unknown");
      } else {
        // Simple: just account address
        accounts.push(seed.path || "unknown");
      }
    }
  });

  return { args, accounts, complex };
};

// NEW: Get status message for PDA
export const getPDAStatusMessage = (
  account: ModIdlAccount,
  formData: Record<string, string | number>,
  accountsAddressMap: Map<string, string | null>
): string => {
  if (!isAccountPda(account)) return "";

  const deps = getPDADependencies(account);
  const missing: string[] = [];

  // Check missing args
  deps.args.forEach((argName) => {
    if (!formData[argName]) {
      missing.push(`argument: ${argName}`);
    }
  });

  // Check missing accounts (simple)
  deps.accounts.forEach((accountName) => {
    if (!accountsAddressMap.get(accountName)) {
      missing.push(`account: ${accountName}`);
    }
  });

  // Check complex dependencies
  deps.complex.forEach((path) => {
    const [accountName] = path.split(".");
    const address =
      formData[accountName] || accountsAddressMap.get(accountName);
    if (!address) {
      missing.push(`account: ${accountName}`);
    }
  });

  if (missing.length === 0) {
    return deps.complex.length > 0
      ? "Deriving (fetching account data)..."
      : "Ready to derive";
  }

  return `Waiting for: ${missing.join(", ")}`;
};

// NEW: Check if can attempt derivation
export const canAttemptDerivation = (
  account: ModIdlAccount,
  formData: Record<string, string | number>,
  accountsAddressMap: Map<string, string | null>
): boolean => {
  if (!isAccountPda(account)) return false;

  const seeds = account.pda?.seeds || [];

  for (const seed of seeds) {
    if (seed.kind === "const") continue;

    if (seed.kind === "arg" && seed.path) {
      if (!formData[seed.path]) return false;
    }

    if (seed.kind === "account") {
      if (seed.account) {
        // Complex: need account address (will fetch data later)
        const [accountName] = seed.path!.split(".");
        const address =
          formData[accountName] || accountsAddressMap.get(accountName);
        if (!address) return false;
      } else {
        // Simple: just need address
        if (!accountsAddressMap.get(seed.path!)) return false;
      }
    }
  }

  return true;
};
