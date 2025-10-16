import type { Idl } from "@coral-xyz/anchor";

export type PDASeed = {
  kind: string;
  value?: number[];
  path?: string;
  account?: string;
};

export type AccountPDADetails = {
  seeds: PDASeed[];
};

export type IdlInstruction = Idl["instructions"][number];
export type ModIdlAccount = IdlInstruction["accounts"][number] & {
  writable?: boolean;
  signer?: boolean;
  address?: string;
  pda?: AccountPDADetails;
};

export interface SavedAccount {
  accountName: string;
  address: string;
  timestamp: number;
  programId: string;
  instructionName: string;
}
