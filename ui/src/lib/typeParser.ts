import type { Idl, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";

// Type definitions for complex IDL types
export type VecType = { vec: IdlType };
export type OptionType = { option: IdlType };
export type DefinedType = {
  defined: string | { name: string; generics?: unknown[] };
};
export type ArrayType = { array: [IdlType, number] };

export type ComplexIdlType =
  | VecType
  | OptionType
  | DefinedType
  | ArrayType
  | IdlType;

// Check if a type is a Vec (vector)
export const isVecType = (type: IdlType): type is VecType => {
  return typeof type === "object" && type !== null && "vec" in type;
};

// Check if a type is an Option
export const isOptionType = (type: IdlType): type is OptionType => {
  return typeof type === "object" && type !== null && "option" in type;
};

// Check if a type is a Defined type (type alias or struct/enum reference)
export const isDefinedType = (type: IdlType): boolean => {
  return typeof type === "object" && type !== null && "defined" in type;
};

// Check if a type is an Array
export const isArrayType = (type: IdlType): type is ArrayType => {
  return typeof type === "object" && type !== null && "array" in type;
};

// Check if a type is an Enum
export const isEnumType = (idl: Idl, type: IdlType): boolean => {
  if (!isDefinedType(type)) return false;
  const typeName = getDefinedTypeName(type as { defined: unknown });
  if (!typeName) return false;
  const definedType = idl.types?.find((t) => t.name === typeName);
  return definedType?.type?.kind === "enum";
};

// Check if a type is a Struct
export const isStructType = (idl: Idl, type: IdlType): boolean => {
  if (!isDefinedType(type)) return false;
  const typeName = getDefinedTypeName(type as { defined: unknown });
  if (!typeName) return false;
  const definedType = idl.types?.find((t) => t.name === typeName);
  return definedType?.type?.kind === "struct";
};

// Helper to extract type name from defined type
export const getDefinedTypeName = (type: {
  defined: unknown;
}): string | null => {
  if (typeof type.defined === "string") {
    return type.defined;
  }
  if (
    typeof type.defined === "object" &&
    type.defined !== null &&
    "name" in type.defined
  ) {
    return typeof type.defined.name === "string" ? type.defined.name : null;
  }
  return null;
};

// Resolve a defined type to its actual definition
export const resolveDefinedType = (
  idl: Idl,
  type: { defined: unknown }
): NonNullable<Idl["types"]>[number] | null => {
  if (!idl.types) return null;
  const typeName = getDefinedTypeName(type);
  if (!typeName) return null;
  return idl.types.find((t) => t.name === typeName) || null;
};

// Get the inner type of a Vec
export const getVecInnerType = (type: VecType): IdlType => {
  return type.vec;
};

// Get the inner type of an Option
export const getOptionInnerType = (type: OptionType): IdlType => {
  return type.option;
};

// Get the inner type and size of an Array
export const getArrayInfo = (
  type: ArrayType
): { inner: IdlType; size: number } => {
  return { inner: type.array[0], size: type.array[1] };
};

// Get enum variants if the type is an enum
export const getEnumVariants = (
  idl: Idl,
  type: IdlType
): Array<{
  name: string;
  fields?: Array<{ name?: string; type: IdlType }> | IdlType[];
}> | null => {
  if (!isDefinedType(type)) return null;
  const definedType = resolveDefinedType(idl, type as { defined: unknown });
  if (!definedType || definedType.type?.kind !== "enum") return null;

  const enumType = definedType.type as {
    variants?: Array<{
      name: string;
      fields?: Array<{ name?: string; type: IdlType }> | IdlType[];
    }>;
  };

  return enumType.variants || null;
};

// Get struct fields if the type is a struct
export const getStructFields = (
  idl: Idl,
  type: IdlType
): Array<{ name: string; type: IdlType }> | null => {
  if (!isDefinedType(type)) return null;
  const definedType = resolveDefinedType(idl, type as { defined: unknown });
  if (!definedType || definedType.type?.kind !== "struct") return null;

  // @ts-expect-error - Anchor's struct fields structure
  return definedType.type.fields || null;
};

// Get a human-readable type name for display
export const getTypeDisplayName = (idl: Idl, type: IdlType): string => {
  if (typeof type === "string") {
    return type;
  }

  if (isVecType(type)) {
    return `Vec<${getTypeDisplayName(idl, getVecInnerType(type))}>`;
  }

  if (isOptionType(type)) {
    return `Option<${getTypeDisplayName(idl, getOptionInnerType(type))}>`;
  }

  if (isArrayType(type)) {
    const { inner, size } = getArrayInfo(type);
    return `[${getTypeDisplayName(idl, inner)}; ${size}]`;
  }

  if (isDefinedType(type)) {
    const typeName = getDefinedTypeName(type as { defined: unknown });
    if (!typeName) return "unknown";
    const definedType = resolveDefinedType(idl, type as { defined: unknown });
    if (definedType) {
      if (definedType.type?.kind === "enum") {
        return `enum ${typeName}`;
      }
      if (definedType.type?.kind === "struct") {
        return `struct ${typeName}`;
      }
    }
    return typeName;
  }

  return "unknown";
};

// Check if a type is nested (contains structs, enums, or other complex types)
export const isNestedType = (idl: Idl, type: IdlType): boolean => {
  if (isDefinedType(type)) {
    return isStructType(idl, type) || isEnumType(idl, type);
  }

  if (isVecType(type)) {
    return isNestedType(idl, getVecInnerType(type));
  }

  if (isOptionType(type)) {
    return isNestedType(idl, getOptionInnerType(type));
  }

  if (isArrayType(type)) {
    return isNestedType(idl, getArrayInfo(type).inner);
  }

  return false;
};