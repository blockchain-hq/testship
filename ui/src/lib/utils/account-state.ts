import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const extractPublicKeys = (data: unknown): string[] => {
  const keys: string[] = [];

  const traverse = (obj: unknown) => {
    if (!obj) return;

    if (obj instanceof PublicKey) {
      keys.push(obj.toBase58());
    } else if (typeof obj === "string") {
      try {
        const pk = new PublicKey(obj);
        // Filter out system program and common system accounts
        if (pk.toBase58() !== "11111111111111111111111111111111") {
          keys.push(pk.toBase58());
        }
      } catch {
        // Not a valid PublicKey
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (typeof obj === "object") {
      Object.values(obj).forEach(traverse);
    }
  };

  traverse(data);
  return [...new Set(keys)];
};

export const countPublicKeyRefs = (data: unknown): number => {
  return extractPublicKeys(data).length;
};

export const formatLamports = (
  lamports: number,
  decimals: number = 4
): string => {
  return `${(lamports / 1e9).toFixed(decimals)} SOL`;
};

export const isValidPublicKey = (value: string): boolean => {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
};

export const isLikelyTimestamp = (value: number | BN): boolean => {
  const num = typeof value === "number" ? value : value.toNumber();

  // Unix timestamp in seconds (between 2000 and 2100)
  const minTimestamp = 946684800; // Jan 1, 2000
  const maxTimestamp = 4102444800; // Jan 1, 2100

  // Check seconds
  if (num >= minTimestamp && num <= maxTimestamp) {
    return true;
  }

  // Check milliseconds
  if (num >= minTimestamp * 1000 && num <= maxTimestamp * 1000) {
    return true;
  }

  return false;
};

export const formatTimestamp = (value: number | BN): string => {
  const num = typeof value === "number" ? value : value.toNumber();

  // Detect if it's in seconds or milliseconds
  const timestamp = num > 1e12 ? num : num * 1000;

  const date = new Date(timestamp);

  // Format: "Nov 25, 2025 3:42 PM"
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatNumberWithCommas = (value: number | BN): string => {
  const num = typeof value === "number" ? value : value.toString();
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const isBN = (value: unknown): value is BN => {
  return Boolean(
    value instanceof BN ||
      (value && typeof value === "object" && "_hex" in value)
  );
};

export const tryDecodeUtf8 = (bytes: Uint8Array | number[]): string | null => {
  try {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(arr);

    // Check if it contains mostly printable characters
    const printableRatio =
      decoded.split("").filter((c) => {
        const code = c.charCodeAt(0);
        return (code >= 32 && code <= 126) || code === 10 || code === 13;
      }).length / decoded.length;

    return printableRatio > 0.8 ? decoded : null;
  } catch {
    return null;
  }
};

export const bytesToHex = (bytes: Uint8Array | number[]): string => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export interface FieldTypeInfo {
  type:
    | "timestamp"
    | "lamports"
    | "publickey"
    | "bytes"
    | "bignumber"
    | "enum"
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "null";
  rawValue: unknown;
  displayValue: string;
  extraData?: {
    isUtf8?: boolean;
    utf8Value?: string;
    hexValue?: string;
    formattedDate?: string;
    formattedNumber?: string;
    solValue?: string;
    truncatedKey?: string;
  };
}

export const analyzeFieldType = (
  key: string,
  value: unknown
): FieldTypeInfo => {
  // Null/undefined
  if (value === null || value === undefined) {
    return { type: "null", rawValue: value, displayValue: "null" };
  }

  // Boolean
  if (typeof value === "boolean") {
    return { type: "boolean", rawValue: value, displayValue: String(value) };
  }

  // PublicKey (instance or valid string)
  if (
    value instanceof PublicKey ||
    (typeof value === "string" && isValidPublicKey(value))
  ) {
    const keyStr = value instanceof PublicKey ? value.toBase58() : value;
    return {
      type: "publickey",
      rawValue: value,
      displayValue: keyStr,
      extraData: {
        truncatedKey: `${keyStr.slice(0, 4)}...${keyStr.slice(-4)}`,
      },
    };
  }

  // BN or large number that could be timestamp
  if (isBN(value) || typeof value === "number") {
    const num = typeof value === "number" ? value : (value as BN).toNumber();

    // Check if field name suggests lamports
    if (key.toLowerCase().includes("lamport")) {
      return {
        type: "lamports",
        rawValue: value,
        displayValue: String(num),
        extraData: {
          solValue: formatLamports(num),
        },
      };
    }

    // Check if it looks like a timestamp
    if (isLikelyTimestamp(value)) {
      return {
        type: "timestamp",
        rawValue: value,
        displayValue: String(num),
        extraData: {
          formattedDate: formatTimestamp(value),
        },
      };
    }

    // Regular big number
    if (isBN(value) || num > 999999) {
      return {
        type: "bignumber",
        rawValue: value,
        displayValue: String(num),
        extraData: {
          formattedNumber: formatNumberWithCommas(value),
        },
      };
    }

    // Regular number
    return { type: "number", rawValue: value, displayValue: String(num) };
  }

  // String
  if (typeof value === "string") {
    return { type: "string", rawValue: value, displayValue: `"${value}"` };
  }

  // Byte array (Uint8Array or number array that looks like bytes)
  if (
    value instanceof Uint8Array ||
    (Array.isArray(value) &&
      value.every((v) => typeof v === "number" && v >= 0 && v <= 255))
  ) {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    const utf8 = tryDecodeUtf8(bytes);
    const hex = bytesToHex(bytes);

    return {
      type: "bytes",
      rawValue: value,
      displayValue: `[${bytes.length} bytes]`,
      extraData: {
        isUtf8: utf8 !== null,
        utf8Value: utf8 || undefined,
        hexValue: hex,
      },
    };
  }

  // Array
  if (Array.isArray(value)) {
    return {
      type: "array",
      rawValue: value,
      displayValue: `[${value.length} items]`,
    };
  }

  // Object (could be enum or nested object)
  if (typeof value === "object") {
    const keys = Object.keys(value);

    // Detect enum-like objects (single key with null or simple value)
    if (keys.length === 1) {
      const enumKey = keys[0];
      const enumValue = (value as Record<string, unknown>)[enumKey];

      if (
        enumValue === null ||
        enumValue === undefined ||
        typeof enumValue === "number" ||
        typeof enumValue === "string"
      ) {
        return {
          type: "enum",
          rawValue: value,
          displayValue:
            enumValue === null || enumValue === undefined
              ? enumKey
              : `${enumKey}(${enumValue})`,
        };
      }
    }

    return {
      type: "object",
      rawValue: value,
      displayValue: `{${keys.length} fields}`,
    };
  }

  return { type: "string", rawValue: value, displayValue: String(value) };
};

export const formatDecodedValue = (value: unknown): string => {
  const info = analyzeFieldType("", value);
  return info.displayValue;
};
