import { useState } from "react";
import { toast } from "sonner";

export const useClearFormHistory = () => {
  const [isClearing, setIsClearing] = useState(false);

  const clearFormHistory = () => {
    setIsClearing(true);
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("testship_form_") ||
            key.startsWith("testship_accounts_"))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      toast.success(`Cleared ${keysToRemove.length} form entries from history`);

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to clear form history:", error);
      toast.error("Failed to clear form history");
    } finally {
      setIsClearing(false);
    }
  };

  const clearFormHistoryWithoutReload = () => {
    setIsClearing(true);
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("testship_form_") ||
            key.startsWith("testship_accounts_"))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      toast.success(`Cleared ${keysToRemove.length} form entries`);

      return keysToRemove.length;
    } catch (error) {
      console.error("Failed to clear form history:", error);
      toast.error("Failed to clear form history");
      return 0;
    } finally {
      setIsClearing(false);
    }
  };

  return { clearFormHistory, clearFormHistoryWithoutReload, isClearing };
};
