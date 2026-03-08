import type {
  TypeNode,
  ProgramNode,
  NumberTypeNode,
  InstructionNode,
  InstructionArgumentNode,
} from "@codama/nodes";
import {
  getU8Codec,
  getU16Codec,
  getU32Codec,
  getU64Codec,
  getU128Codec,
  getI8Codec,
  getI16Codec,
  getI32Codec,
  getI64Codec,
  getI128Codec,
  getF32Codec,
  getF64Codec,
  getBooleanCodec,
  getUtf8Codec,
  getBytesCodec,
  getOptionCodec,
  getArrayCodec,
  getStructCodec,
  getTupleCodec,
  getMapCodec,
  getSetCodec,
  getAddressCodec,
  addCodecSizePrefix,
  type Codec,
} from "@solana/kit";

const numberCodecs: Record<string, () => Codec<any>> = {
  u8: getU8Codec,
  u16: getU16Codec,
  u32: getU32Codec,
  u64: getU64Codec,
  u128: getU128Codec,
  i8: getI8Codec,
  i16: getI16Codec,
  i32: getI32Codec,
  i64: getI64Codec,
  i128: getI128Codec,
  f32: getF32Codec,
  f64: getF64Codec,
};

export const typeNodeToCodec = (
  type: TypeNode,
  programNode: ProgramNode
): Codec<any> => {
  switch (type.kind) {
    case "numberTypeNode":
      return numberCodecFor(type);

    case "booleanTypeNode":
      return getBooleanCodec();

    case "publicKeyTypeNode":
      return getAddressCodec();

    case "stringTypeNode":
      return addCodecSizePrefix(getUtf8Codec(), getU32Codec());

    case "bytesTypeNode":
      return getBytesCodec();

    case "optionTypeNode":
      return getOptionCodec(typeNodeToCodec(type.item, programNode));

    case "arrayTypeNode": {
      const itemCodec = typeNodeToCodec(type.item, programNode);
      if (type.count.kind === "fixedCountNode") {
        return getArrayCodec(itemCodec, { size: type.count.value });
      }
      return getArrayCodec(itemCodec);
    }

    case "structTypeNode": {
      const fields = type.fields.map(
        (f) => [f.name, typeNodeToCodec(f.type, programNode)] as const
      );
      return getStructCodec(fields as any);
    }

    case "tupleTypeNode": {
      const items = type.items.map((t) => typeNodeToCodec(t, programNode));
      return getTupleCodec(items as any);
    }

    case "mapTypeNode":
      return getMapCodec(
        typeNodeToCodec(type.key, programNode),
        typeNodeToCodec(type.value, programNode)
      );

    case "setTypeNode":
      return getSetCodec(typeNodeToCodec(type.item, programNode));

    case "enumTypeNode": {
      // Borsh enums: u8 discriminator + variant data
      // For simple enums (no data variants), just use u8
      return getU8Codec();
    }

    case "definedTypeLinkNode": {
      const resolved = programNode.definedTypes.find(
        (d) => d.name === type.name
      );
      if (!resolved) {
        throw new Error(`Unknown defined type: ${type.name}`);
      }
      return typeNodeToCodec(resolved.type, programNode);
    }

    default:
      throw new Error(`Unsupported type: ${type.kind}`);
  }
};

const numberCodecFor = (type: NumberTypeNode): Codec<any> => {
  const factory = numberCodecs[type.format];
  if (!factory) throw new Error(`Unsupported number format: ${type.format}`);
  return factory();
};

export const buildInstructionData = (
  instruction: InstructionNode,
  args: Record<string, any>,
  programNode: ProgramNode
): Uint8Array => {
  const parts: Uint8Array[] = [];

  if (instruction.discriminators && instruction.discriminators.length > 0) {
    const disc = instruction.discriminators[0];
    if (disc.kind === "constantDiscriminatorNode") {
      const val = disc.constant.value;
      if (val.kind === "bytesValueNode") {
        parts.push(new Uint8Array(hexToBytes(val.data)));
      }
    }
  }

  for (const arg of instruction.arguments) {
    const codec = typeNodeToCodec(arg.type, programNode);
    const value = coerceValue(arg, args[arg.name]);
    const encoded = codec.encode(value);
    parts.push(new Uint8Array(encoded));
  }

  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
};

const hexToBytes = (hex: string): number[] => {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
};

const coerceValue = (arg: InstructionArgumentNode, raw: any): any => {
  if (raw === undefined || raw === null) return raw;

  const type = arg.type;
  if (type.kind === "numberTypeNode") {
    const format = type.format;
    if (format.includes("64") || format.includes("128")) {
      return BigInt(raw);
    }
    return Number(raw);
  }
  if (type.kind === "booleanTypeNode") {
    return Boolean(raw);
  }
  return raw;
};
