import type { Idl } from "@coral-xyz/anchor";

export type IdlInstruction = Idl["instructions"][number];
export type ModIdlAccount = IdlInstruction["accounts"][number] & {
  writable?: boolean;
  signer?: boolean;
  address?: string;
};
