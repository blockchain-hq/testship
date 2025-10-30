/* eslint-disable react-refresh/only-export-components */
import type { SavedAccount } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SAVED_ACCOUNTS_KEY = "savedAccounts";

type SavedAccountsContextType = {
  savedAccounts: SavedAccount[];
  addSavedAccount: (savedAccount: SavedAccount) => void;
  removeSavedAccount: (address: string) => void;
  clearSavedAccounts: () => void;
  getAccountsByType: (type?: string) => SavedAccount[];
  hasAccount: (address: string) => boolean;
};

const SavedAccountsContext = createContext<SavedAccountsContextType | null>(
  null
);

const getSavedAccountsFromStorage = (): SavedAccount[] => {
  try {
    const savedAccounts = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (savedAccounts) {
      return JSON.parse(savedAccounts);
    }
  } catch (error) {
    console.error("Failed to get saved accounts from localStorage", error);
  }
  return [];
};

const saveSavedAccountsToStorage = (accounts: SavedAccount[]) => {
  try {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error("Failed to save accounts to localStorage", error);
  }
};

export const SavedAccountsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(
    getSavedAccountsFromStorage()
  );

  useEffect(() => {
    saveSavedAccountsToStorage(savedAccounts);
  }, [savedAccounts]);

  const addSavedAccount = useCallback((account: SavedAccount) => {
    setSavedAccounts((prev) => {
      const exists = prev.some((a) => a.address === account.address);
      if (exists) {
        return prev;
      }

      return [account, ...prev];
    });
  }, []);

  const removeSavedAccount = useCallback((address: string) => {
    setSavedAccounts((prev) => prev.filter((a) => a.address !== address));
  }, []);

  const clearSavedAccounts = useCallback(() => {
    setSavedAccounts([]);
  }, []);

  const getAccountsByType = useCallback(
    (type?: string) => {
      if (!type) return savedAccounts;
      return savedAccounts.filter((a) => a.instructionName === type);
    },
    [savedAccounts]
  );

  const hasAccount = useCallback(
    (address: string) => {
      return savedAccounts.some((a) => a.address === address);
    },
    [savedAccounts]
  );

  return (
    <SavedAccountsContext.Provider
      value={{
        savedAccounts,
        addSavedAccount,
        removeSavedAccount,
        clearSavedAccounts,
        getAccountsByType,
        hasAccount,
      }}
    >
      {children}
    </SavedAccountsContext.Provider>
  );
};

export const useSavedAccounts = () => {
  const context = useContext(SavedAccountsContext);
  if (!context) {
    throw new Error("useSavedAccounts must be within SavedAccountsProvider");
  }
  return context;
};
