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

export type TransactionResult = {
  id: string;
  signature?: string;
  status: "success" | "error" | "pending";
  logs: TransactionResultLog[];
  timestamp: Date;
  explorerUrl?: string;
};

export type TransactionResultLog = {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning";
  message: string;
  data?: any;
};

export interface SharedArg {
  name: string;
  value: string | number;
}

export interface SharedAccount {
  name: string;
  address?: string | null;
}

export interface SharedInstruction {
  name: string;
  args: SharedArg[];
  accounts: SharedAccount[];
}

export interface SharedState {
  idl: Idl;
  instructions: SharedInstruction[];
  timestamp: number;
}
