/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import type { GlobalInstructionsState, InstructionState } from "@/lib/types";

type InstructionsContextType = {
  instructionsState: GlobalInstructionsState;
  activeInstruction: string | null;
  setActiveInstruction: (name: string) => void;
  updateInstructionState: (
    name: string,
    updates: Partial<InstructionState>
  ) => void;
  getInstructionState: (name: string) => InstructionState;
  clearInstructionState: (name: string) => void;
  clearAllState: () => void;
};

const InstructionsContext = createContext<InstructionsContextType | null>(null);

export const InstructionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [instructionsState, setInstructionsState] =
    useState<GlobalInstructionsState>({});

  const [activeInstruction, setActiveInstruction] = useState<string | null>(
    null
  );

  const updateInstructionState = useCallback(
    (name: string, updates: Partial<InstructionState>) => {
      setInstructionsState((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          ...updates,
          lastUpdated: new Date(),
        },
      }));
    },
    []
  );

  const getInstructionState = useCallback(
    (name: string): InstructionState => {
      return (
        instructionsState[name] || {
          formData: {},
          accountsAddresses: new Map(),
          signersKeypairs: new Map(),
        }
      );
    },
    [instructionsState]
  );

  const clearInstructionState = useCallback((name: string) => {
    setInstructionsState((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearAllState = useCallback(() => {
    setInstructionsState({});
  }, []);

  return (
    <InstructionsContext.Provider
      value={{
        instructionsState,
        activeInstruction,
        setActiveInstruction,
        updateInstructionState,
        getInstructionState,
        clearInstructionState,
        clearAllState,
      }}
    >
      {children}
    </InstructionsContext.Provider>
  );
};

export const useInstructions = () => {
  const context = useContext(InstructionsContext);
  if (!context)
    throw new Error("useInstructions must be within InstructionsProvider");
  return context;
};
