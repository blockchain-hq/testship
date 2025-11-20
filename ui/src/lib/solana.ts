import type { Idl, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import type { PDASeed } from "./types";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { toCamelCase } from "./utils";

const getByteSize = (type: IdlType): number => {
  if (type === "u8" || type === "i8") return 1;
  if (type === "u16" || type === "i16") return 2;
  if (type === "u32" || type === "i32") return 4;
  return 8;
};

export const toBuffer = (value: unknown, type: IdlType) => {
  if (BN.isBN(value)) {
    const size = getByteSize(type);
    return new Uint8Array(value.toArray("le", size));
  }

  if (
    ["u8", "u16", "u32", "u64", "i8", "i16", "i32", "i64"].includes(
      type as string
    )
  ) {
    // @ts-expect-error: type is set to unknown due to dynamic logic generation
    const num = new BN(value);
    const size = getByteSize(type);
    return new Uint8Array(num.toArray("le", size));
  }

  if (type === "string") {
    return new TextEncoder().encode(value as string);
  }

  if (type === "pubkey") {
    return new PublicKey(value as string).toBytes();
  }

  throw new Error(`Unsupported type: ${type}`);
};

export const toAnchorType = (value: unknown, type: IdlType) => {
  if (typeof type !== "string") return value;

  switch (type) {
    case "u8":
    case "u16":
    case "u32":
    case "u64":
    case "i8":
    case "i16":
    case "i32":
    case "i64":
      // @ts-expect-error: unknown type due to type not known at compile time
      return new BN(value);
    case "bool":
      return typeof value === "boolean" ? value : value === "true";
    case "string":
      return String(value);
    case "pubkey":
      return new PublicKey(value as string);
    default:
      return value;
  }
};

export const derivePDA = async (
  seeds: PDASeed[],
  programId: string,
  accounts: Map<string, string | null>,
  args: Record<string, unknown>,
  connection: Connection,
  idl: Idl,
  pdaProgram?: { kind: "const"; value: number[] }
): Promise<PublicKey> => {
  const buffers: Uint8Array[] = [];

  for (const seed of seeds) {
    if (seed.kind === "const" && seed.value) {
      buffers.push(new Uint8Array(seed.value));
      continue;
    }

    if (seed.kind === "arg" && seed.path) {
      const argValue = args[seed.path];
      if (!argValue) throw new Error(`Missing arg: ${seed.path}`);

      const argType = idl.instructions
        .flatMap((ix) => ix.args)
        .find((arg) => arg.name === seed.path)?.type;

      if (!argType) throw new Error(`Unknown arg type: ${seed.path}`);

      buffers.push(toBuffer(argValue, argType));
      continue;
    }

    if (seed.kind === "account" && !seed.account) {
      const address = accounts.get(seed.path!);
      if (!address) throw new Error(`Missing account: ${seed.path}`);
      buffers.push(new PublicKey(address).toBytes());
      continue;
    }

    if (seed.kind === "account" && seed.account) {
      const buffer = await extractAccountSeed(
        seed,
        accounts,
        args,
        connection,
        idl
      );
      buffers.push(buffer);
      continue;
    }
  }

  // Ensure each seed is <= 32 bytes. If longer, hash with SHA-256 to 32 bytes.
  const normalizedBuffers = await Promise.all(
    buffers.map(async (b) => {
      if (b.length <= 32) return b;
      const data = new Uint8Array(b);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return new Uint8Array(digest);
    })
  );

  const derivationProgramId = pdaProgram
    ? new PublicKey(new Uint8Array(pdaProgram.value))
    : new PublicKey(programId);

  const [pda] = PublicKey.findProgramAddressSync(
    normalizedBuffers,
    derivationProgramId
  );
  return pda;
};

const extractAccountSeed = async (
  seed: PDASeed,
  accounts: Map<string, string | null>,
  args: Record<string, unknown>,
  connection: Connection,
  idl: Idl
): Promise<Uint8Array> => {
  if (!seed.path) throw new Error("Seed path required");

  const [accountName, fieldName] = seed.path.split(".");
  if (!fieldName) throw new Error("Invalid seed path");

  // Get account address
  const address = args[accountName] || accounts.get(accountName);
  if (!address) throw new Error(`Missing account: ${accountName}`);

  // Fetch account
  const info = await connection.getAccountInfo(new PublicKey(address));
  if (!info) throw new Error(`Account not found: ${accountName}`);

  // Decode
  const coder = new BorshAccountsCoder(idl);
  const decoded = coder.decode(seed.account || accountName, info.data);

  // Get field value
  const camelField = toCamelCase(fieldName);
  const value = decoded[camelField] || decoded[fieldName];
  if (value === undefined) throw new Error(`Field not found: ${fieldName}`);

  // Get field type
  const accountType = idl.types?.find((t) => t.name === seed.account);
  // @ts-expect-error: inferred types are not comprehensive
  const field = (accountType as unknown)?.type.fields.find(
    // @ts-expect-error: inferred types are not comprehensive
    (f: unknown) => f.name === fieldName || toCamelCase(f.name) === camelField
  );
  if (!field) throw new Error(`Field type not found: ${fieldName}`);

  // Convert to buffer
  if (value instanceof PublicKey) {
    return value.toBytes();
  }
  return toBuffer(value, field.type);
};
