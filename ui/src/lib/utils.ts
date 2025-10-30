import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Formats an Anchor IDL type to a readable string
 * Handles complex types like Vec, Option, arrays, and defined types
 * Safe for all Anchor IDL type formats with proper fallbacks
 */
export const formatIdlType = (type: IdlType): string => {
  // Handle null/undefined
  if (type === null || type === undefined) {
    return "[Unknown Type]";
  }

  // Handle simple string types (primitives: u8, u16, u32, u64, i8, i16, i32, i64, bool, string, pubkey, etc.)
  if (typeof type === "string") {
    return type;
  }

  // Handle complex object types
  if (typeof type === "object") {
    // Handle Vec types: { vec: IdlType }
    // Check first because Vec is commonly nested with other types
    if ("vec" in type && type.vec !== null && type.vec !== undefined) {
      try {
        const innerType = formatIdlType(type.vec);
        return `Vec<${innerType}>`;
      } catch {
        return "Vec<?>";
      }
    }

    // Handle Option types: { option: IdlType }
    if ("option" in type && type.option !== null && type.option !== undefined) {
      try {
        const innerType = formatIdlType(type.option);
        return `Option<${innerType}>`;
      } catch {
        return "Option<?>";
      }
    }

    // Handle COption types
    if ("coption" in type && type.coption !== null && type.coption !== undefined) {
      try {
        const innerType = formatIdlType(type.coption);
        return `COption<${innerType}>`;
      } catch {
        return "COption<?>";
      }
    }

    // Handle tuple types: { tuple: IdlType[] }
    if ("tuple" in type && Array.isArray((type as any).tuple)) {
      try {
        const items = ((type as any).tuple as IdlType[]).map((t) =>
          formatIdlType(t)
        );
        return `(${items.join(", ")})`;
      } catch {
        return "(?, ?)";
      }
    }

    // Handle array types: { array: [IdlType, number] }
    if ("array" in type && type.array) {
      if (Array.isArray(type.array) && type.array.length >= 2) {
        try {
          const innerType = formatIdlType(type.array[0]);
          const size = type.array[1];
          if (typeof size === "number") {
            return `[${innerType}; ${size}]`;
          }
          return `[${innerType}; ?]`;
        } catch {
          return "[?; ?]";
        }
      }
      // Malformed array, but still try to show something
      return "[Array]";
    }

    // Handle defined types (custom structs): { defined: string | { name: string } }
    if ("defined" in type) {
      const definedValue = (type as any).defined;
      if (typeof definedValue === "string") {
        return definedValue;
      }
      // Some versions use { defined: { name: string } }
      if (definedValue && typeof definedValue === "object" && "name" in definedValue) {
        return definedValue.name;
      }
      if (definedValue) {
        return String(definedValue);
      }
    }

    // Fallback: try to stringify for debugging (helps identify unknown formats)
    // This handles edge cases we haven't seen yet
    try {
      const stringified = JSON.stringify(type);
      // If JSON is too long or unhelpful, provide a short message
      if (stringified.length > 100) {
        return "[Complex Type]";
      }
      return stringified;
    } catch {
      return "[Complex Type]";
    }
  }

  // Final fallback for any unexpected format
  return String(type);
};
