import type { ModIdlAccount, PDASeed } from "@/lib/types";

export const createConstSeed = (value: number[]): PDASeed => ({
  kind: "const",
  value,
});

export const createArgSeed = (path: string): PDASeed => ({
  kind: "arg",
  path,
});

export const createAccountSeed = (path: string): PDASeed => ({
  kind: "account",
  path,
});

export const createComplexAccountSeed = (
  path: string,
  account: string
): PDASeed => ({
  kind: "account",
  path,
  account,
});

export const nonPdaAccount: ModIdlAccount = {
  name: "user",
  writable: true,
  signer: true,
};

export const simplePdaAccount: ModIdlAccount = {
  name: "vault",
  accounts: [],
  writable: true,
  signer: true,
  pda: {
    seeds: [createConstSeed([118, 97, 117, 108, 116])], // "vault"
  },
};

export const argPdaAccount: ModIdlAccount = {
  name: "user_profile",
  accounts: [],
  writable: true,
  pda: {
    seeds: [
      createConstSeed([112, 114, 111, 102, 105, 108, 101]), // "profile"
      createArgSeed("user_id"),
    ],
  },
};

export const accountPdaAccount: ModIdlAccount = {
  name: "associated_token",
  accounts: [],
  writable: true,
  pda: {
    seeds: [
      createAccountSeed("owner"),
      createConstSeed([116, 111, 107, 101, 110]), // "token"
      createAccountSeed("mint"),
    ],
  },
};

export const complexPdaAccount: ModIdlAccount = {
  name: "metadata",
  accounts: [],
  writable: true,
  pda: {
    seeds: [
      createConstSeed([109, 101, 116, 97, 100, 97, 116, 97]), // "metadata"
      createComplexAccountSeed("token_account.mint", "TokenAccount"),
    ],
  },
};

export const mixedPdaAccount: ModIdlAccount = {
  name: "escrow",
  accounts: [],
  writable: true,
  pda: {
    seeds: [
      createConstSeed([101, 115, 99, 114, 111, 119]), // "escrow"
      createArgSeed("escrow_id"),
      createAccountSeed("authority"),
      createComplexAccountSeed("mint_account.supply", "Mint"),
    ],
  },
};

export const emptyPdaAccount: ModIdlAccount = {
  name: "empty",
  writable: true,
  pda: {
    seeds: [],
  },
};
