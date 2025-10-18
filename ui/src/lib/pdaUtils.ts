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
