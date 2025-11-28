import { Connection, PublicKey } from "@solana/web3.js";
import { type Idl, BorshCoder } from "@coral-xyz/anchor";
import BN from "bn.js";

/**
 * Serializes a value for storage (handles special Solana types)
 */
export const serializeForStorage = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof PublicKey) {
    return { __type: "PublicKey", value: value.toBase58() };
  }

  if (BN.isBN(value)) {
    return { __type: "BN", value: value.toString() };
  }

  if (value instanceof Uint8Array) {
    return { __type: "Uint8Array", value: Array.from(value) };
  }

  if (Array.isArray(value)) {
    return value.map(serializeForStorage);
  }

  if (typeof value === "object") {
    const serialized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      serialized[key] = serializeForStorage(val);
    }
    return serialized;
  }

  return value;
};

/**
 * Deserializes a stored value (reconstructs special Solana types)
 */
export const deserializeFromStorage = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "__type" in value &&
    "value" in value
  ) {
    const typed = value as { __type: string; value: unknown };
    switch (typed.__type) {
      case "PublicKey":
        return new PublicKey(typed.value as string);
      case "BN":
        return new BN(typed.value as string);
      case "Uint8Array":
        return new Uint8Array(typed.value as number[]);
    }
  }

  if (Array.isArray(value)) {
    return value.map(deserializeFromStorage);
  }

  if (typeof value === "object") {
    const deserialized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      deserialized[key] = deserializeFromStorage(val);
    }
    return deserialized;
  }

  return value;
};

/**
 * Captures a snapshot of an account's current state
 */
export const captureAccountSnapshot = async (
  connection: Connection,
  publicKey: PublicKey,
  idl: Idl | null
): Promise<{ decoded: unknown; accountType?: string } | null> => {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);

    if (!accountInfo) {
      return null;
    }

    // Try to decode with IDL if available
    if (idl && accountInfo.owner.equals(new PublicKey(idl.address))) {
      try {
        const coder = new BorshCoder(idl);

        // Try each account type in the IDL
        for (const accountDef of idl.accounts || []) {
          try {
            const decoded = coder.accounts.decode(
              accountDef.name,
              accountInfo.data
            );
            return {
              decoded: serializeForStorage(decoded),
              accountType: accountDef.name,
            };
          } catch {
            // Try next account type
            continue;
          }
        }
      } catch (error) {
        console.warn("Failed to decode account with IDL:", error);
      }
    }

    // If decoding fails or no IDL, return raw data
    return {
      decoded: {
        data: serializeForStorage(accountInfo.data),
        lamports: accountInfo.lamports,
        owner: serializeForStorage(accountInfo.owner),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch,
      },
      accountType: "raw",
    };
  } catch (error) {
    console.error("Error capturing account snapshot:", error);
    return null;
  }
};

/**
 * Compares two values deeply and returns whether they're different
 */
const areValuesDifferent = (val1: unknown, val2: unknown): boolean => {
  if (val1 === val2) return false;

  if (
    val1 === null ||
    val1 === undefined ||
    val2 === null ||
    val2 === undefined
  ) {
    return val1 !== val2;
  }

  // Handle BN comparison
  if (BN.isBN(val1) && BN.isBN(val2)) {
    return !val1.eq(val2);
  }

  // Handle PublicKey comparison
  if (val1 instanceof PublicKey && val2 instanceof PublicKey) {
    return !val1.equals(val2);
  }

  // Handle Uint8Array comparison
  if (val1 instanceof Uint8Array && val2 instanceof Uint8Array) {
    if (val1.length !== val2.length) return true;
    return !val1.every((byte, i) => byte === val2[i]);
  }

  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return true;
    return val1.some((item, i) => areValuesDifferent(item, val2[i]));
  }

  // Handle objects
  if (typeof val1 === "object" && typeof val2 === "object") {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) return true;

    return keys1.some((key) => {
      const objVal1 = (val1 as Record<string, unknown>)[key];
      const objVal2 = (val2 as Record<string, unknown>)[key];
      return areValuesDifferent(objVal1, objVal2);
    });
  }

  return true;
};

/**
 * Get a list of field paths that changed between two decoded states
 */
export const getChangedFields = (
  before: unknown,
  after: unknown,
  path: string = ""
): string[] => {
  const changes: string[] = [];

  if (
    before === null ||
    before === undefined ||
    after === null ||
    after === undefined
  ) {
    if (before !== after) {
      return [path || "root"];
    }
    return [];
  }

  // Handle non-object types
  if (typeof before !== "object" || typeof after !== "object") {
    if (areValuesDifferent(before, after)) {
      return [path || "value"];
    }
    return [];
  }

  // Handle arrays
  if (Array.isArray(before) && Array.isArray(after)) {
    if (areValuesDifferent(before, after)) {
      return [path || "array"];
    }
    return [];
  }

  // Handle objects
  const beforeObj = before as Record<string, unknown>;
  const afterObj = after as Record<string, unknown>;

  const allKeys = new Set([
    ...Object.keys(beforeObj),
    ...Object.keys(afterObj),
  ]);

  for (const key of allKeys) {
    const fieldPath = path ? `${path}.${key}` : key;
    const beforeVal = beforeObj[key];
    const afterVal = afterObj[key];

    if (areValuesDifferent(beforeVal, afterVal)) {
      changes.push(fieldPath);
    }
  }

  return changes;
};

/**
 * Calculate field-level diff information
 */
export interface FieldDiff {
  fieldKey: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified";
}

export const calculateFieldDiff = (
  oldValue: unknown,
  newValue: unknown,
  fieldKey: string
): FieldDiff => {
  if (oldValue === undefined || oldValue === null) {
    return {
      fieldKey,
      oldValue,
      newValue,
      changeType: "added",
    };
  }

  if (newValue === undefined || newValue === null) {
    return {
      fieldKey,
      oldValue,
      newValue,
      changeType: "removed",
    };
  }

  return {
    fieldKey,
    oldValue,
    newValue,
    changeType: "modified",
  };
};

/**
 * Compare two account states and return structured diff information
 */
export interface AccountStateDiff {
  changedFields: string[];
  fieldDiffs: Record<string, FieldDiff>;
  hasChanges: boolean;
}

export const compareAccountStates = (
  before: unknown,
  after: unknown
): AccountStateDiff => {
  const changedFields = getChangedFields(before, after);
  const fieldDiffs: Record<string, FieldDiff> = {};

  if (
    !before ||
    !after ||
    typeof before !== "object" ||
    typeof after !== "object"
  ) {
    return {
      changedFields,
      fieldDiffs,
      hasChanges: changedFields.length > 0,
    };
  }

  const beforeObj = before as Record<string, unknown>;
  const afterObj = after as Record<string, unknown>;

  // Only calculate diffs for top-level fields for now
  for (const field of changedFields) {
    if (!field.includes(".")) {
      // Top-level field
      fieldDiffs[field] = calculateFieldDiff(
        beforeObj[field],
        afterObj[field],
        field
      );
    }
  }

  return {
    changedFields,
    fieldDiffs,
    hasChanges: changedFields.length > 0,
  };
};
