import { useIDL } from "@/context/IDLContext";
import { useInstructions } from "@/context/InstructionsContext";
import { encodeStateToURL } from "@/lib/sharing";
import { useCallback, useState } from "react";

const UseShareState = () => {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { idl } = useIDL();
  const { instructionsState, activeInstruction } = useInstructions();

  const prepareUrl = useCallback(
    (baseUrl: string) => {
      if (!idl) throw Error("IDL not found");

      // remove keypairs from instructions
      const instructions = Object.fromEntries(
        Object.entries(instructionsState).map(([instruction, state]) => {
          return [
            instruction,
            {
              ...state,
              signersKeypairs: new Map(),
            },
          ];
        })
      );

      const url = encodeStateToURL(
        {
          idl,
          instructions,
          activeInstruction,
        },
        baseUrl
      );

      if (!url) throw Error("URL for sharing could not be generated");

      setShareUrl(url);
    },
    [idl, instructionsState, activeInstruction]
  );

  return {
    shareUrl,
    prepareUrl,
  };
};

export default UseShareState;
