import { useCluster } from "@/context/ClusterContext";
import { useIDL } from "@/context/IDLContext";
import { useInstructions } from "@/context/InstructionsContext";
import { decodeStateFromURL } from "@/lib/sharing";
import type { GlobalInstructionsState } from "@/lib/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const useLoadSharedState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setIdl } = useIDL();
  const { setActiveInstruction, setAllInstructionsState } = useInstructions();
  const { setCluster, cluster } = useCluster();

  // load shared state from URL
  useEffect(() => {
    const loadSharedState = async () => {
      const sharedState = decodeStateFromURL();
      if (!sharedState) return;

      setIsLoading(true);
      setError(null);

      try {
        if (!sharedState.idl) throw new Error("IDL not found");

        setIdl(sharedState.idl);

        // wait for idl to propogate
        await new Promise((resolve) => setTimeout(resolve, 100));

        const deserializedInstructions: GlobalInstructionsState = {};
        Object.entries(sharedState.instructions).forEach(
          ([instructionName, instructionState]) => {
            deserializedInstructions[instructionName] = {
              formData: instructionState.formData,
              accountsAddresses: new Map(
                Object.entries(instructionState.accountsAddresses)
              ),
              signersKeypairs: new Map(),
              lastUpdated: new Date(),
            };
          }
        ); 
        setAllInstructionsState(deserializedInstructions);

        if (sharedState.activeInstruction) {
          setActiveInstruction(sharedState.activeInstruction);
        }

        if (sharedState.cluster && sharedState.cluster.name !== cluster.name) {
          setCluster(sharedState.cluster);
        }

        toast.success("Successfully loaded shared state!");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        toast.error(`Failed to load shared state: ${message}`);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSharedState();
  }, [setIdl, setAllInstructionsState, setActiveInstruction]);

  return { isLoading, error };
};

export default useLoadSharedState;
