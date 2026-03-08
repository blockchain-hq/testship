import { useEffect, useState, useRef, useCallback } from "react";
import type { InstructionAccountNode, ProgramNode } from "@codama/nodes";
import { address, getAddressEncoder, getProgramDerivedAddress } from "@solana/kit";

export type DerivedPDA = {
  address: string;
  status: "idle" | "deriving" | "ready" | "error";
  error?: string;
};

type PdaValueNode = {
  kind: "pdaValueNode";
  pda: {
    kind: "pdaNode";
    name: string;
    seeds: PdaDefSeed[];
  };
  seeds: PdaSeedBinding[];
};

type PdaDefSeed =
  | { kind: "constantPdaSeedNode"; type: any; value: { kind: "bytesValueNode"; data: string; encoding: string } }
  | { kind: "variablePdaSeedNode"; name: string; type: any };

type PdaSeedBinding = {
  kind: "pdaSeedValueNode";
  name: string;
  value:
    | { kind: "accountValueNode"; name: string }
    | { kind: "argumentValueNode"; name: string };
};

export const isPdaAccount = (account: InstructionAccountNode): boolean => {
  const dv = account.defaultValue as any;
  return dv?.kind === "pdaValueNode";
};

export const getPdaNode = (account: InstructionAccountNode): PdaValueNode | null => {
  const dv = account.defaultValue as any;
  if (dv?.kind === "pdaValueNode") return dv as PdaValueNode;
  return null;
};

export const getPdaDependencies = (
  account: InstructionAccountNode
): { args: string[]; accounts: string[] } => {
  const pda = getPdaNode(account);
  if (!pda) return { args: [], accounts: [] };

  const args: string[] = [];
  const accounts: string[] = [];

  for (const binding of pda.seeds) {
    if (binding.value.kind === "argumentValueNode") {
      args.push(binding.value.name);
    } else if (binding.value.kind === "accountValueNode") {
      accounts.push(binding.value.name);
    }
  }

  return { args, accounts };
};

const base58Decode = (encoded: string): Uint8Array => {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const BASE = BigInt(58);
  let num = BigInt(0);
  for (const char of encoded) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base58 char: ${char}`);
    num = num * BASE + BigInt(idx);
  }
  const hex = num.toString(16).padStart(2, "0");
  const bytes = new Uint8Array(hex.length / 2 + (hex.length % 2));
  const padded = hex.length % 2 ? "0" + hex : hex;
  for (let i = 0; i < padded.length; i += 2) {
    bytes[i / 2] = parseInt(padded.substring(i, i + 2), 16);
  }
  // handle leading 1s
  let leadingZeros = 0;
  for (const char of encoded) {
    if (char === "1") leadingZeros++;
    else break;
  }
  if (leadingZeros > 0) {
    const result = new Uint8Array(leadingZeros + bytes.length);
    result.set(bytes, leadingZeros);
    return result;
  }
  return bytes;
};

const seedToBytes = (
  defSeed: PdaDefSeed,
  binding: PdaSeedBinding | undefined,
  accountValues: Record<string, string>,
  argValues: Record<string, any>
): Uint8Array | null => {
  if (defSeed.kind === "constantPdaSeedNode") {
    const val = defSeed.value;
    if (val.encoding === "base58") {
      return base58Decode(val.data);
    }
    // hex fallback
    const hex = val.data;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  if (defSeed.kind === "variablePdaSeedNode" && binding) {
    let rawValue: any;
    if (binding.value.kind === "accountValueNode") {
      rawValue = accountValues[binding.value.name];
    } else {
      rawValue = argValues[binding.value.name];
    }

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      return null;
    }

    const seedType = defSeed.type;
    if (seedType.kind === "publicKeyTypeNode") {
      const encoder = getAddressEncoder();
      return new Uint8Array(encoder.encode(address(String(rawValue))));
    }
    if (seedType.kind === "stringTypeNode") {
      return new TextEncoder().encode(String(rawValue));
    }
    if (seedType.kind === "numberTypeNode") {
      return numberToLeBytes(Number(rawValue), seedType.format);
    }
    // fallback: encode as string
    return new TextEncoder().encode(String(rawValue));
  }

  return null;
};

const numberToLeBytes = (value: number, format: string): Uint8Array => {
  const match = format.match(/([iu])(\d+)/);
  if (!match) return new Uint8Array([value & 0xff]);
  const byteSize = parseInt(match[2]) / 8;
  const buf = new ArrayBuffer(byteSize);
  const view = new DataView(buf);
  if (byteSize === 1) view.setUint8(0, value);
  else if (byteSize === 2) view.setUint16(0, value, true);
  else if (byteSize === 4) view.setUint32(0, value, true);
  else if (byteSize === 8) {
    view.setBigUint64(0, BigInt(value), true);
  }
  return new Uint8Array(buf);
};

const derivePdaAddress = async (
  pdaNode: PdaValueNode,
  accountValues: Record<string, string>,
  argValues: Record<string, any>,
  programAddress: string
): Promise<string> => {
  const seedBytes: Uint8Array[] = [];

  for (const defSeed of pdaNode.pda.seeds) {
    const binding = defSeed.kind === "variablePdaSeedNode"
      ? pdaNode.seeds.find((s) => s.name === defSeed.name)
      : undefined;

    const bytes = seedToBytes(defSeed, binding, accountValues, argValues);
    if (bytes === null) {
      throw new Error(`Missing seed value for ${defSeed.kind === "variablePdaSeedNode" ? defSeed.name : "constant"}`);
    }
    seedBytes.push(bytes);
  }

  const [derived] = await getProgramDerivedAddress({
    programAddress: address(programAddress),
    seeds: seedBytes,
  });

  return derived;
};

export const useAutoDerivePDAs = (
  accounts: InstructionAccountNode[],
  programNode: ProgramNode,
  accountValues: Record<string, string>,
  argValues: Record<string, any>
) => {
  const [derivedPDAs, setDerivedPDAs] = useState<Map<string, DerivedPDA>>(
    new Map()
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const derivePDAs = useCallback(async () => {
    if (!programNode.publicKey) return;

    const pdaAccounts = accounts.filter(isPdaAccount);

    for (const account of pdaAccounts) {
      const pdaNode = getPdaNode(account);
      if (!pdaNode) continue;

      const deps = getPdaDependencies(account);
      const allDepsReady =
        deps.accounts.every((name) => accountValues[name]?.trim()) &&
        deps.args.every((name) => {
          const v = argValues[name];
          return v !== undefined && v !== null && v !== "";
        });

      if (!allDepsReady) {
        setDerivedPDAs((prev) => {
          const existing = prev.get(account.name);
          if (existing?.status === "idle") return prev;
          const next = new Map(prev);
          next.set(account.name, { address: "", status: "idle" });
          return next;
        });
        continue;
      }

      setDerivedPDAs((prev) => {
        const existing = prev.get(account.name);
        if (existing?.status === "deriving") return prev;
        const next = new Map(prev);
        next.set(account.name, { address: "", status: "deriving" });
        return next;
      });

      try {
        const derived = await derivePdaAddress(
          pdaNode,
          accountValues,
          argValues,
          programNode.publicKey
        );

        setDerivedPDAs((prev) => {
          const next = new Map(prev);
          next.set(account.name, { address: derived, status: "ready" });
          return next;
        });
      } catch (err) {
        setDerivedPDAs((prev) => {
          const next = new Map(prev);
          next.set(account.name, {
            address: "",
            status: "error",
            error: err instanceof Error ? err.message : "Failed to derive",
          });
          return next;
        });
      }
    }
  }, [accounts, programNode, accountValues, argValues]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      derivePDAs();
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [derivePDAs]);

  return derivedPDAs;
};
