import { PublicKey } from "@solana/web3.js";

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

export const formatDecodedValue = (value: unknown): string => {
  if (value === null || value === undefined) return "null";

  if (typeof value === "string") {
    return isValidPublicKey(value) ? value : `"${value}"`;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof PublicKey) {
    return value.toBase58();
  }

  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  if (typeof value === "object") {
    return `{${Object.keys(value).length} fields}`;
  }

  return String(value);
};
