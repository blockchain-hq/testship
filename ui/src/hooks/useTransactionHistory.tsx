import { useState, useEffect } from "react";

export interface AccountSnapshot {
  before: unknown;
  after: unknown;
  accountType?: string;
}

export interface TransactionRecord {
  signature: string;
  instructionName: string;
  programId: string;
  status: "success" | "error";
  timestamp: number;
  error?: string;
  accounts?: Record<string, string | null>;
  accountSnapshots?: Record<string, AccountSnapshot>;
}

const TRANSACTION_HISTORY_KEY = "pulse_transaction_history";
const MAX_HISTORY_SIZE = 100; // last 100 records
const MAX_SNAPSHOTS_SIZE = 20; // Only keep detailed snapshots for the most recent 20 transactions

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const stored = localStorage.getItem(TRANSACTION_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      console.log("updating transactions to local storage");
      console.log(transactions, "txs");
      localStorage.setItem(
        TRANSACTION_HISTORY_KEY,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Failed to save transaction history:", error);
    }
  }, [transactions]);

  const addTransaction = (transaction: TransactionRecord) => {
    console.log("adding tx: ", transaction);
    setTransactions((prev) => {
      const newHistory = [transaction, ...prev]; // newest first
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_SIZE);
      
      // Prune snapshots from older transactions to save space
      return trimmedHistory.map((tx, index) => {
        if (index >= MAX_SNAPSHOTS_SIZE && tx.accountSnapshots) {
          // Remove snapshots from transactions beyond the limit
          const { accountSnapshots, ...txWithoutSnapshots } = tx;
          return txWithoutSnapshots;
        }
        return tx;
      });
    });
  };

  const clearHistory = () => {
    setTransactions([]);
    localStorage.removeItem(TRANSACTION_HISTORY_KEY);
  };

  const removeTransaction = (signature: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.signature !== signature));
  };

  return {
    transactions,
    addTransaction,
    clearHistory,
    removeTransaction,
  };
}
