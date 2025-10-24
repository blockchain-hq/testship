import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";

export const deriveTypeForForm = (type: IdlType): string => {
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
        return "number";
      case "bool":
        return "boolean";
      default:
        return "string";
    }
  }
  return "string";
};
