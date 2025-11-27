import type { Idl, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import type { PDASeed } from "./types";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { toCamelCase } from "./utils";
import {
  isVecType,
  isOptionType,
  isDefinedType,
  isArrayType,
  isEnumType,
  isStructType,
  getVecInnerType,
  getOptionInnerType,
  getArrayInfo,
  getStructFields,
  getEnumVariants,
  getDefinedTypeName,
} from "./typeParser";

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

/**
 * Check if a field type is optional (Option<T>)
 */
function isOptionalType(type: IdlType): boolean {
  return typeof type === "object" && type !== null && "option" in type;
}

/**
 * Convert a string to camelCase (matching Anchor's internal behavior)
 * - "Admin" → "admin"
 * - "MyVariant" → "myVariant"  
 * - "USA" → "usa"
 * - "snake_case" → "snakeCase"
 */
function toEnumVariantCase(str: string): string {
  // Handle snake_case first
  if (str.includes("_")) {
    return str
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  // For PascalCase or ALL_CAPS, convert to camelCase
  // First letter lowercase, then follow the original casing for the rest
  // But for ALL_CAPS like "USA", convert entirely to lowercase
  if (str === str.toUpperCase() && str.length > 1) {
    // All uppercase like "USA", "UK" → "usa", "uk"
    return str.toLowerCase();
  }
  // PascalCase like "Admin" → "admin", "MyVariant" → "myVariant"
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Converts a value to the appropriate Anchor type for transaction submission.
 * Handles all IDL types including Vec, Option, Array, Enum, and Struct.
 *
 * For Anchor 0.30+:
 * - Enum variants must be camelCase (Anchor converts internally using camelCase)
 * - Struct fields use snake_case (exact casing from IDL/Rust)
 */
export const toAnchorType = (
  value: unknown,
  type: IdlType,
  idl?: Idl
): unknown => {
  // Handle null/undefined early for Option types
  if (value === null || value === undefined) {
    if (isOptionType(type)) {
      return null;
    }
    return value;
  }

  // Handle Vec types
  if (isVecType(type)) {
    if (!Array.isArray(value)) {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const innerType = getVecInnerType(type);
            return parsed.map((item, index) => {
              try {
                return toAnchorType(item, innerType, idl);
              } catch (e) {
                throw new Error(
                  `Error in Vec item [${index}]: ${e instanceof Error ? e.message : e}`
                );
              }
            });
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes("Error in Vec item")) {
            throw e;
          }
        }
      }
      throw new Error(`Expected array for Vec type, got ${typeof value}`);
    }
    const innerType = getVecInnerType(type);
    return value.map((item, index) => {
      try {
        return toAnchorType(item, innerType, idl);
      } catch (e) {
        throw new Error(
          `Error in Vec item [${index}]: ${e instanceof Error ? e.message : e}`
        );
      }
    });
  }

  // Handle Option types
  if (isOptionType(type)) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const innerType = getOptionInnerType(type);
    return toAnchorType(value, innerType, idl);
  }

  // Handle Array types (fixed size)
  if (isArrayType(type)) {
    if (!Array.isArray(value)) {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const { inner, size } = getArrayInfo(type);
            if (parsed.length !== size) {
              throw new Error(
                `Expected array of size ${size}, got ${parsed.length}`
              );
            }
            return parsed.map((item) => toAnchorType(item, inner, idl));
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes("Expected array")) {
            throw e;
          }
        }
      }
      throw new Error(`Expected array for Array type, got ${typeof value}`);
    }
    const { inner, size } = getArrayInfo(type);
    if (value.length !== size) {
      throw new Error(`Expected array of size ${size}, got ${value.length}`);
    }
    return value.map((item) => toAnchorType(item, inner, idl));
  }

  // Handle Defined types (Enum or Struct)
  if (isDefinedType(type)) {
    const typeName = getDefinedTypeName(type as { defined: unknown });

    // Handle Enum types
    if (idl && isEnumType(idl, type)) {
      return convertEnumValue(value, type, idl);
    }

    // Handle Struct types
    if (idl && isStructType(idl, type)) {
      return convertStructValue(value, type, idl, typeName || "unknown");
    }

    return value;
  }

  // Handle simple string types (primitives)
  if (typeof type === "string") {
    switch (type) {
      case "u8":
      case "u16":
      case "u32":
      case "u64":
      case "u128":
      case "i8":
      case "i16":
      case "i32":
      case "i64":
      case "i128":
        if (BN.isBN(value)) return value;
        if (typeof value === "number") {
          if (!Number.isInteger(value)) {
            throw new Error(`Invalid ${type}: expected integer, got ${value}`);
          }
          return new BN(value.toString());
        }
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed === "" || trimmed === "-" || trimmed === "+") {
            throw new Error(
              `Invalid ${type}: empty or incomplete number "${value}"`
            );
          }

          // Reject incomplete scientific notation
          if (/[eE][+-]?$/.test(trimmed)) {
            throw new Error(
              `Invalid ${type}: "${value}" appears to be incomplete scientific notation`
            );
          }

          const num = Number(trimmed);
          if (isNaN(num) || !isFinite(num)) {
            throw new Error(`Invalid ${type}: "${value}" is not a valid number`);
          }
          if (!Number.isInteger(num)) {
            throw new Error(
              `Invalid ${type}: expected integer, got "${value}"`
            );
          }
          if (type === "u8" && (num < 0 || num > 255)) {
            throw new Error(`Invalid u8: value ${num} is out of range (0-255)`);
          }
          return new BN(trimmed);
        }
        throw new Error(`Cannot convert ${typeof value} to ${type}`);

      case "bool":
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
          return value.toLowerCase() === "true";
        }
        return Boolean(value);

      case "string":
        return String(value);

      case "pubkey":
        if (value instanceof PublicKey) return value;
        if (typeof value === "string") {
          return new PublicKey(value);
        }
        throw new Error(`Cannot convert ${typeof value} to PublicKey`);

      case "bytes":
        if (value instanceof Uint8Array) return value;
        if (Array.isArray(value)) return new Uint8Array(value);
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return new Uint8Array(parsed);
          } catch {
            return new TextEncoder().encode(value);
          }
        }
        throw new Error(`Cannot convert ${typeof value} to bytes`);

      default:
        return value;
    }
  }

  return value;
};

/**
 * Converts a value to an Anchor enum format for Anchor 0.30+
 *
 * CRITICAL: Anchor's BorshInstructionCoder uses camelCase for enum variant names!
 * - "Admin" in IDL → expects { admin: {} } in code
 * - "USA" in IDL → expects { usa: {} } in code
 * - "MyVariant" in IDL → expects { myVariant: {} } in code
 *
 * Format: { variantName: {} } for unit variants
 *         { variantName: { field1: value1 } } for struct variants
 */
function convertEnumValue(value: unknown, type: IdlType, idl: Idl): unknown {
  const variants = getEnumVariants(idl, type);
  const typeName = getDefinedTypeName(type as { defined: unknown });

  // If value is already in object format { VariantName: ... }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const inputKey = Object.keys(value)[0];

    if (inputKey) {
      // Find the matching variant in IDL (case-insensitive search for matching)
      const matchedVariant = variants?.find(
        (v) =>
          v.name === inputKey ||
          v.name.toLowerCase() === inputKey.toLowerCase() ||
          toEnumVariantCase(v.name) === inputKey ||
          toEnumVariantCase(v.name).toLowerCase() === inputKey.toLowerCase()
      );

      if (matchedVariant) {
        const fieldsValue = (value as Record<string, unknown>)[inputKey];

        // CRITICAL: Convert to camelCase for Anchor's Borsh encoder
        const variantName = toEnumVariantCase(matchedVariant.name);

        // No fields or empty fields
        if (fieldsValue === undefined || fieldsValue === null) {
          return { [variantName]: {} };
        }

        if (
          typeof fieldsValue === "object" &&
          Object.keys(fieldsValue as object).length === 0
        ) {
          return { [variantName]: {} };
        }

        // Handle array fields (tuple variant)
        if (Array.isArray(fieldsValue)) {
          const processedFields = processEnumTupleFields(
            fieldsValue,
            matchedVariant,
            idl
          );
          return { [variantName]: processedFields };
        }

        // Handle object fields (struct variant)
        if (typeof fieldsValue === "object" && !Array.isArray(fieldsValue)) {
          const processedFields = processEnumStructFields(
            fieldsValue as Record<string, unknown>,
            matchedVariant,
            idl
          );
          return { [variantName]: processedFields };
        }

        // Single primitive field
        if (
          matchedVariant.fields &&
          Array.isArray(matchedVariant.fields) &&
          matchedVariant.fields.length === 1
        ) {
          const fieldDef = matchedVariant.fields[0] as { type?: IdlType };
          if (fieldDef?.type) {
            return {
              [variantName]: toAnchorType(fieldsValue, fieldDef.type, idl),
            };
          }
        }

        return { [variantName]: fieldsValue };
      } else {
        throw new Error(
          `Unknown enum variant "${inputKey}" for type ${typeName}. Available: ${variants?.map((v) => v.name).join(", ")}`
        );
      }
    }
  }

  // If value is a string, treat as variant name
  if (typeof value === "string") {
    const matchedVariant = variants?.find(
      (v) =>
        v.name === value ||
        v.name.toLowerCase() === value.toLowerCase() ||
        toCamelCase(v.name) === value ||
        toCamelCase(v.name).toLowerCase() === value.toLowerCase()
    );

    if (!matchedVariant) {
      throw new Error(
        `Unknown enum variant "${value}" for type ${typeName}. Available: ${variants?.map((v) => v.name).join(", ")}`
      );
    }

    // CRITICAL: Convert to camelCase for Anchor's Borsh encoder
    return { [toEnumVariantCase(matchedVariant.name)]: {} };
  }

  throw new Error(
    `Invalid enum value for type ${typeName}: ${JSON.stringify(value)}. Expected string or object like { VariantName: {} }`
  );
}

/**
 * Process tuple fields for an enum variant
 */
function processEnumTupleFields(
  fields: unknown[],
  variant: { name: string; fields?: unknown },
  idl: Idl
): unknown[] {
  if (!variant.fields || !Array.isArray(variant.fields)) {
    return fields;
  }

  return fields.map((item, index) => {
    const fieldDef = variant.fields as Array<{ name?: string; type?: IdlType }>;
    const field = fieldDef[index];

    if (field?.type) {
      return toAnchorType(item, field.type, idl);
    }
    return item;
  });
}

/**
 * Process struct fields for an enum variant
 */
function processEnumStructFields(
  fields: Record<string, unknown>,
  variant: { name: string; fields?: unknown },
  idl: Idl
): Record<string, unknown> {
  if (!variant.fields || !Array.isArray(variant.fields)) {
    return fields;
  }

  const result: Record<string, unknown> = {};
  const fieldDefs = variant.fields as Array<{ name?: string; type: IdlType }>;

  for (const fieldDef of fieldDefs) {
    if (!fieldDef.name) continue;

    const fieldValue =
      fields[fieldDef.name] ?? fields[toCamelCase(fieldDef.name)];
    result[fieldDef.name] = toAnchorType(fieldValue, fieldDef.type, idl);
  }

  return result;
}

/**
 * Converts a value to an Anchor struct format for Anchor 0.30+
 * Validates that required fields are present.
 */
function convertStructValue(
  value: unknown,
  type: IdlType,
  idl: Idl,
  structName: string
): unknown {
  const fields = getStructFields(idl, type);

  // CRITICAL: Check if value is the correct type
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        value = parsed;
      } else {
        throw new Error(
          `Invalid value for struct "${structName}": expected object with fields {${fields?.map((f) => f.name).join(", ")}}, got string`
        );
      }
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("Invalid value for struct")
      ) {
        throw e;
      }
      throw new Error(
        `Invalid value for struct "${structName}": expected object with fields {${fields?.map((f) => f.name).join(", ")}}, got non-JSON string`
      );
    }
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `Invalid value for struct "${structName}": expected object with fields {${fields?.map((f) => f.name).join(", ")}}, got ${Array.isArray(value) ? "array" : typeof value}`
    );
  }

  const structValue = value as Record<string, unknown>;

  if (!fields) {
    return structValue;
  }

  const result: Record<string, unknown> = {};
  const missingRequiredFields: string[] = [];

  for (const field of fields) {
    // Try both original and camelCase field names from input
    let fieldValue =
      structValue[field.name] ?? structValue[toCamelCase(field.name)];
    const isOptional = isOptionalType(field.type);

    // Check for missing required fields
    if (
      (fieldValue === undefined || fieldValue === null || fieldValue === "") &&
      !isOptional
    ) {
      missingRequiredFields.push(field.name);
    }

    // For optional fields, convert undefined/empty string to null
    if (isOptional && (fieldValue === undefined || fieldValue === "")) {
      fieldValue = null;
    }

    // Use the EXACT field name from IDL for struct fields
    try {
      result[field.name] = toAnchorType(fieldValue, field.type, idl);
    } catch (e) {
      throw new Error(
        `Error converting field "${field.name}" in struct "${structName}": ${e instanceof Error ? e.message : e}`
      );
    }
  }

  // Throw error if required fields are missing
  if (missingRequiredFields.length > 0) {
    throw new Error(
      `Missing required fields in struct "${structName}": ${missingRequiredFields.join(", ")}. ` +
        `Received: ${JSON.stringify(structValue)}`
    );
  }

  return result;
}

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

  const normalizedBuffers = buffers.map((b) => {
    if (b.length > 32) {
      throw new Error(
        `Seed exceeds 32 bytes (${b.length} bytes), each seed must be less than or equal to 32 bytes`
      );
    }
    return b;
  });

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

  const address = args[accountName] || accounts.get(accountName);
  if (!address) throw new Error(`Missing account: ${accountName}`);

  const info = await connection.getAccountInfo(new PublicKey(address));
  if (!info) throw new Error(`Account not found: ${accountName}`);

  const coder = new BorshAccountsCoder(idl);
  const decoded = coder.decode(seed.account || accountName, info.data);

  const camelField = toCamelCase(fieldName);
  const value = decoded[camelField] || decoded[fieldName];
  if (value === undefined) throw new Error(`Field not found: ${fieldName}`);

  const accountType = idl.types?.find((t) => t.name === seed.account);
  // @ts-expect-error: inferred types are not comprehensive
  const field = (accountType as unknown)?.type.fields.find(
    // @ts-expect-error: inferred types are not comprehensive
    (f: unknown) => f.name === fieldName || toCamelCase(f.name) === camelField
  );
  if (!field) throw new Error(`Field type not found: ${fieldName}`);

  if (value instanceof PublicKey) {
    return value.toBytes();
  }
  return toBuffer(value, field.type);
};