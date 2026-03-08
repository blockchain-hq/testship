import { create } from "zustand";

type InstructionState = {
  selected: string | null;
  select: (name: string) => void;
  clear: () => void;
};

export const useInstructionStore = create<InstructionState>((set) => ({
  selected: null,
  select: (name) => set({ selected: name }),
  clear: () => set({ selected: null }),
}));
