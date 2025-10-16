import type { SavedAccount } from "@/lib/types";
import { useEffect, useState } from "react";

const SAVED_ACCOUNTS_KEY = "savedAccounts";
const getSavedAccountsFromStorage = (): SavedAccount[] => {
  try {
    const savedAccounts = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (savedAccounts) {
      return JSON.parse(savedAccounts);
    }
  } catch (error) {
    console.log("Failed to get saved accounts from localStorage", error);
  }

  return [];
};

const addSavedAccountFromStorage = (savedAccount: SavedAccount) => {
  const existingSavedAccounts = getSavedAccountsFromStorage();
  const newSavedAccounts = [...existingSavedAccounts, savedAccount];
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(newSavedAccounts));
};

const UseSavedAccounts = () => {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(
    getSavedAccountsFromStorage()
  );

  useEffect(() => {
    console.log(savedAccounts);
  }, [savedAccounts]);

  const addSavedAccount = (savedAccount: SavedAccount) => {
    addSavedAccountFromStorage(savedAccount);
    setSavedAccounts((prevSavedAccounts) => [
      ...prevSavedAccounts,
      savedAccount,
    ]);
  };

  return {
    savedAccounts,
    addSavedAccount,
  };
};

export default UseSavedAccounts;
