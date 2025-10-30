import { useEffect, useState, useRef, useCallback } from "react";
import type { IdlInstruction, ModIdlAccount } from "@/lib/types";
import type { Idl } from "@coral-xyz/anchor";
import { isAccountPda } from "@/lib/pdaUtils";
import { derivePDA } from "@/lib/solana";
import { useConnection } from "@solana/wallet-adapter-react";

export type DerivedPDA = {
  address: string;
  status: "idle" | "deriving" | "ready" | "error";
  error?: string;
};

export const useAutoDerivePDAs = (
  instruction: IdlInstruction | null,
  idl: Idl | null,
  formData: Record<string, string | number>,
  accountsAddressMap: Map<string, string | null>
) => {
  const { connection } = useConnection();
  const [derivedPDAs, setDerivedPDAs] = useState<Map<string, DerivedPDA>>(
    new Map()
  );

  const debounceTimer = useRef<NodeJS.Timeout>(null);

  const derivePDAsForInstruction = useCallback(async () => {
    if (!instruction || !idl) return;

    const pdaAccounts = instruction.accounts.filter(isAccountPda);

    for (const account of pdaAccounts as ModIdlAccount[]) {
      const canDerive = checkDependencies(
        account,
        formData,
        accountsAddressMap
      );

      if (!canDerive.ready) {
        setDerivedPDAs((prev) => {
          const alreadyDerived = prev.get(account.name);
          if (alreadyDerived?.status !== "idle") {
            const newMap = new Map(prev);
            newMap.set(account.name, {
              address: "",
              status: "idle",
            });
            return newMap;
          }
          return prev;
        });
        continue;
      }

      setDerivedPDAs((prev) => {
        const existingAddress = accountsAddressMap.get(account.name);
        const alreadyDerived = prev.get(account.name);

        if (
          existingAddress &&
          alreadyDerived?.status === "ready" &&
          alreadyDerived.address === existingAddress
        ) {
          return prev;
        }

        if (alreadyDerived?.status === "deriving") {
          return prev;
        }

        const newMap = new Map(prev);
        newMap.set(account.name, {
          address: "",
          status: "deriving",
        });

        (async () => {
          try {
            const pda = await derivePDA(
              account.pda?.seeds || [],
              idl.address,
              accountsAddressMap,
              formData,
              connection,
              idl
            );

            setDerivedPDAs((current) => {
              const updated = new Map(current);
              updated.set(account.name, {
                address: pda.toBase58(),
                status: "ready",
              });
              return updated;
            });
          } catch (error) {
            console.error(`Failed to derive PDA for ${account.name}:`, error);

            setDerivedPDAs((current) => {
              const updated = new Map(current);
              updated.set(account.name, {
                address: "",
                status: "error",
                error:
                  error instanceof Error ? error.message : "Failed to derive",
              });
              return updated;
            });
          }
        })();

        return newMap;
      });
    }
  }, [instruction, idl, formData, accountsAddressMap, connection]);

  useEffect(() => {
    if (!instruction || !idl) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      derivePDAsForInstruction();
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    instruction,
    idl,
    formData,
    accountsAddressMap,
    connection,
    derivePDAsForInstruction,
  ]);

  return derivedPDAs;
};

function checkDependencies(
  account: ModIdlAccount,
  formData: Record<string, string | number>,
  accountsAddressMap: Map<string, string | null>
): { ready: boolean; missing: string[] } {
  const seeds = account.pda?.seeds || [];
  const missing: string[] = [];

  for (const seed of seeds) {
    if (seed.kind === "const") {
      continue;
    }

    if (seed.kind === "arg" && seed.path) {
      if (!formData[seed.path]) {
        missing.push(`arg: ${seed.path}`);
      }
    }

    if (seed.kind === "account") {
      if (seed.account) {
        const [accountName] = seed.path!.split(".");
        const address =
          formData[accountName] || accountsAddressMap.get(accountName);
        if (!address) {
          missing.push(`account: ${accountName}`);
        }
      } else {
        const address = accountsAddressMap.get(seed.path!);
        if (!address) {
          missing.push(`account: ${seed.path}`);
        }
      }
    }
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}
