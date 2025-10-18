import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { PublicKey } from "@solana/web3.js";

export const validateField = (name: string, value: unknown, type?: IdlType) => {
  if (value === null || value === undefined) {
    return `${name} is required`;
  }

  if (typeof value === "string" && value.trim() === "") {
    return `${name} is required`;
  }

  if (!type) {
    try {
      new PublicKey(value);
      return null;
    } catch {
      return `${name} must be a valid address`;
    }
  }

  if (typeof type === "string") {
    switch (type) {
      case "u8": {
        const u8Value = Number(value);
        if (
          isNaN(u8Value) ||
          !Number.isInteger(u8Value) ||
          u8Value < 0 ||
          u8Value > 255
        ) {
          return `${name} must be a valid u8 (0-255)`;
        }
        break;
      }
      case "u16": {
        const u16Value = Number(value);
        if (
          isNaN(u16Value) ||
          !Number.isInteger(u16Value) ||
          u16Value < 0 ||
          u16Value > 65535
        ) {
          return `${name} must be a valid u16 (0-65535)`;
        }
        break;
      }
      case "u32": {
        const u32Value = Number(value);
        if (
          isNaN(u32Value) ||
          !Number.isInteger(u32Value) ||
          u32Value < 0 ||
          u32Value > 4294967295
        ) {
          return `${name} must be a valid u32 (0-4294967295)`;
        }
        break;
      }
      case "u64": {
        const u64Value = Number(value);
        if (
          isNaN(u64Value) ||
          !Number.isInteger(u64Value) ||
          u64Value < 0 ||
          u64Value > Number.MAX_SAFE_INTEGER
        ) {
          return `${name} must be a valid u64 (0-${Number.MAX_SAFE_INTEGER})`;
        }
        break;
      }
      case "i8": {
        const i8Value = Number(value);
        if (
          isNaN(i8Value) ||
          !Number.isInteger(i8Value) ||
          i8Value < -128 ||
          i8Value > 127
        ) {
          return `${name} must be a valid i8 (-128 to 127)`;
        }
        break;
      }
      case "i16": {
        const i16Value = Number(value);
        if (
          isNaN(i16Value) ||
          !Number.isInteger(i16Value) ||
          i16Value < -32768 ||
          i16Value > 32767
        ) {
          return `${name} must be a valid i16 (-32768 to 32767)`;
        }
        break;
      }
      case "i32": {
        const i32Value = Number(value);
        if (
          isNaN(i32Value) ||
          !Number.isInteger(i32Value) ||
          i32Value < -2147483648 ||
          i32Value > 2147483647
        ) {
          return `${name} must be a valid i32 (-2147483648 to 2147483647)`;
        }
        break;
      }
      case "i64": {
        const i64Value = Number(value);
        if (
          isNaN(i64Value) ||
          !Number.isInteger(i64Value) ||
          i64Value < Number.MIN_SAFE_INTEGER ||
          i64Value > Number.MAX_SAFE_INTEGER
        ) {
          return `${name} must be a valid i64 (${Number.MIN_SAFE_INTEGER} to ${Number.MAX_SAFE_INTEGER})`;
        }
        break;
      }
      case "bool":
        if (
          typeof value !== "boolean" &&
          value !== "true" &&
          value !== "false"
        ) {
          return `${name} must be a valid boolean (true or false)`;
        }
        break;
      default:
        break;
    }
  }

  return null;
};

export const getUserMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "Something went wrong";
  }

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid public key")) {
    return "Invalid address format";
  }
  if (msg.includes("account not found")) {
    return "Account not found. Initialize it first.";
  }
  if (msg.includes("wallet")) {
    return "Wallet error. Check your connection.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Check your connection.";
  }

  return error.message;
};
