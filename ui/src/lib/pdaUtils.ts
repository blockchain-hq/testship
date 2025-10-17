import type { Idl, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import type { IdlInstruction, ModIdlAccount, PDASeed } from "./types";
import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { toCamelCase } from "./utils";

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

export const isPdaComplexToDerive = (account: ModIdlAccount) => {
  if (!isAccountPda(account)) return false;

  const seeds = account.pda?.seeds;
  if (!seeds) return false;

  return seeds.some((seed) => seed.kind === "account" && seed.account);
};

export const convertToBuffer = (value: any, type: IdlType) => {
  // TODO: support more types

  if (BN.isBN(value)) {
    let byteSize = 8;
    if (type === "u8" || type === "i8") byteSize = 1;
    if (type === "u16" || type === "i16") byteSize = 2;
    if (type === "u32" || type === "i32") byteSize = 4;
    if (type === "u64" || type === "i64") byteSize = 8;

    const arr = value.toArray("le", byteSize);
    return new Uint8Array(arr);
  }

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

export const derivePda = async (
  seeds: PDASeed[],
  programId: string,
  instruction: IdlInstruction,
  accountAddressMap: Map<string, string | null>,
  formData: any,
  connection?: Connection,
  idl?: Idl
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
    } else if (seed.kind === "account" && seed.account) {
      if (!connection || !idl) {
        return { data: null, error: "Missing connection or idl" };
      }
      const { data: seedValue, error } = await extractSeedForAccountKindPda(
        seed,
        formData,
        accountAddressMap,
        connection,
        idl
      );
      if (error || !seedValue) {
        return { data: null, error: "Missing seed value" };
      }

      seedBuffers.push(seedValue);
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

export const getAccountInfo = async (
  accAddress: string,
  connection: Connection
) => {
  try {
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(accAddress)
    );
    if (!accountInfo) {
      return { data: null, error: "Account not found" };
    }

    return { data: accountInfo, error: null };
  } catch (error) {
    console.log(`Error getting account info for address: ${accAddress}`, error);
    return { data: null, error: error };
  }
};

export const extractSeedForAccountKindPda = async (
  pdaSeed: PDASeed,
  formData: any,
  accouuntAddressMap: Map<string, string | null>,
  connection: Connection,
  idl: Idl
) => {
  console.log("extractSeedForAccountKindPda", pdaSeed);
  console.log(formData, "formData");
  console.log(accouuntAddressMap, "accouuntAddressMap");
  // first we need to find out which other field or address, this seed depends from
  const seedPath = pdaSeed.path;
  if (!seedPath) return { data: null, error: "Missing seed path" };
  console.log("got seed path");

  const seedPathParts = seedPath.split(".");

  if (seedPathParts.length === 2) {
    const [accountName, fieldName] = seedPathParts;
    console.log(accountName, fieldName, "accountName, fieldName");
    const accountAddress =
      formData[accountName] || accouuntAddressMap.get(accountName);
    console.log(accountAddress, "accountAddress");
    if (
      accountAddress === undefined ||
      accountAddress === null ||
      accountAddress === ""
    ) {
      return {
        data: null,
        error: `Please provide account address for ${accountName}`,
      };
    }

    const { data: accountInfo, error } = await getAccountInfo(
      accountAddress,
      connection
    );
    console.log(accountInfo, "accountInfo");

    if (error || !accountInfo) {
      console.log(error, "error getting account info");
      return { data: null, error: error || "Account not found" };
    }

    const coder = new BorshAccountsCoder(idl);
    const decoded = coder.decode(
      pdaSeed.account || accountName,
      accountInfo.data
    );
    const camelFieldName = toCamelCase(fieldName);
    console.log(decoded, "decoded");
    const value = decoded[camelFieldName] || decoded[fieldName];
    console.log(value, "final value from extractSeedForAccountKindPda");
    console.log(typeof value);

    if (BN.isBN(value)) {
      console.log("value is BN");
      const accountType = idl.types?.find((t) => t.name === pdaSeed.account);
      console.log(accountType, "accountType");
      const field = (accountType as any)?.type.fields.find(
        (f: { name: string }) =>
          f.name === fieldName || toCamelCase(f.name) === camelFieldName
      );
      console.log(field, "field");

      const fieldType = field?.type;
      console.log(fieldType, "fieldType");

      return { data: convertToBuffer(value, fieldType), error: null };
    }

    return { data: value, error: null };
  }

  return { data: null, error: "Invalid seed path" };
};

export const convertArgValue = (value: any, type: IdlType): any => {
  if (typeof type === "string") {
    switch (type) {
      case "u8":
      case "u16":
      case "u32":
      case "u64":
      case "i8":
      case "i16":
      case "i32":
      case "i64":
        // Convert to BN for all integer types
        return new BN(value);

      case "bool":
        return typeof value === "boolean" ? value : value === "true";

      case "string":
        return String(value);

      case "pubkey":
        return new PublicKey(value);

      default:
        return value;
    }
  }

  return value;
};
