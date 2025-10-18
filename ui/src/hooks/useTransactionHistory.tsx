import { useState, useEffect } from "react";

export interface TransactionRecord {
  signature: string;
  instructionName: string;
  programId: string;
  status: "success" | "error";
  timestamp: number;
  error?: string;
  accounts?: Record<string, string | null>;
}

const TRANSACTION_HISTORY_KEY = "pulse_transaction_history";
const MAX_HISTORY_SIZE = 100; // last 100 records

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
      return newHistory.slice(0, MAX_HISTORY_SIZE);
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
