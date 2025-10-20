import { getURLForSharing } from "@/lib/sharing-utils";
import type {
  IdlInstruction,
  ModIdlAccount,
  SharedInstruction,
} from "@/lib/types";
import { toCamelCase } from "@/lib/utils";
import type { Idl } from "@coral-xyz/anchor";
import { useState } from "react";

const UseShareState = () => {
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const prepareUrl = (
    idl: Idl,
    accountMap: Map<string, string | null>,
    instructions: IdlInstruction[],
    formData: Record<string, string | number>
  ) => {
    console.log("preparing url");
    const formattedInstructions: SharedInstruction[] = instructions.map(
      (idx) => ({
        name: idx.name,
        args: idx.args.map((arg) => ({
          name: arg.name,
          value: formData[arg.name],
        })),
        accounts: idx.accounts.map((acc: ModIdlAccount) => ({
          name: acc.name,
          address:
            accountMap.get(acc.name) || accountMap.get(toCamelCase(acc.name)),
        })),
      })
    );
    console.log("formatted instructions", formattedInstructions);

    const url = getURLForSharing({
      idl,
      instructions: formattedInstructions,
      timestamp: new Date().getTime(),
    });

    if (!url) throw Error("URL for sharing could not be generated");

    setShareUrl(url);

    console.log(shareUrl);
  };

  return {
    shareUrl,
    prepareUrl,
  };
};

export default UseShareState;
