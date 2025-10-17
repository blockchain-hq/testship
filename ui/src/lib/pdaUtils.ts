import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import type { IdlInstruction, ModIdlAccount, PDASeed } from "./types";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export const isAccountPda = (account: ModIdlAccount) => {
  return account.pda !== undefined;
};

export const isPdaAutoDerivable = (account: ModIdlAccount) => {
  if (!isAccountPda(account)) return false;

  const seeds = account.pda?.seeds;
  if (!seeds) return false;

  // if any of the seeds have kind account, then its not derivable
  return seeds.every((seed) => seed.kind !== "account");
};

export const convertToBuffer = (value: any, type: IdlType) => {
  // TODO: support more types
  if (type === "u64" || type === "i64") {
    const num = new BN(value);
    const arr = num.toArray("le", 8);
    return new Uint8Array(arr);
  }

  if (type === "u32" || type === "i32") {
    const num = new BN(value);
    const arr = num.toArray("le", 4);
    return new Uint8Array(arr);
  }

  if (type === "u8" || type === "i8") {
    const num = new BN(value);
    const arr = num.toArray("le", 1);
    return new Uint8Array(arr);
  }

  if (type === "string") {
    return new TextEncoder().encode(value);
  }

  if (type === "pubkey") {
    return new PublicKey(value).toBytes();
  }

  throw Error(`Unsupported type: ${type}`);
};

export const derivePda = (
  seeds: PDASeed[],
  programId: string,
  instruction: IdlInstruction,
  formData: any
) => {
  const seedBuffers: Uint8Array[] = [];

  for (const seed of seeds) {
    if (seed.kind === "const" && seed.value) {
      seedBuffers.push(new Uint8Array(seed.value));
    } else if (seed.kind === "arg") {
      const argType = instruction.args.find(
        (arg) => arg.name === seed.path
      )?.type;

      if (!argType) {
        return {
          data: null,
          error: `Missing argument type for ${seed.path}`,
        };
      }

      if (argType && seed.path) {
        const argValue = formData[seed.path];
        // validate
        if (argValue === undefined || argValue === null || argValue === "") {
          return {
            data: null,
            error: `Missing argument value for ${seed.path}`,
          };
        }

        try {
          const buffer = convertToBuffer(argValue, argType);
          seedBuffers.push(buffer);
        } catch (error) {
          return {
            data: null,
            error: `Invalid argument value for ${seed.path}: ${error}`,
          };
        }
      }
    }
  }

  try {
    const result = PublicKey.findProgramAddressSync(
      seedBuffers,
      new PublicKey(programId)
    );

    return { data: result[0], error: null };
  } catch (error) {
    return { data: null, error };
  }
};
