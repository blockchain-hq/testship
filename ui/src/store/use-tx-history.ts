import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TxRecord = {
  signature: string;
  instructionName: string;
  programName: string;
  status: "success" | "error";
  error?: string;
  timestamp: number;
  logs?: string[];
};

type TxHistoryState = {
  transactions: TxRecord[];
  addTransaction: (tx: TxRecord) => void;
  removeTransaction: (signature: string) => void;
  clearHistory: () => void;
};

export const useTxHistory = create<TxHistoryState>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (tx) =>
        set((s) => ({ transactions: [tx, ...s.transactions] })),

      removeTransaction: (signature) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.signature !== signature),
        })),

      clearHistory: () => set({ transactions: [] }),
    }),
    {
      name: "testship-tx-history",
    }
  )
);
