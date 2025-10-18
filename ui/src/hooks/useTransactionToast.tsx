import { toast } from "sonner";
import { TransactionToast } from "@/components/TransactionToast";
import type { ParsedError } from "@/lib/errorParser";

export function useTransactionToast() {
  return {
    success: (signature: string, message?: string) => {
      toast.success("Transaction Successful", {
        description: (
          <TransactionToast
            signature={signature}
            status="success"
            message={message}
          />
        ),
        duration: 10000,
      });
    },

    error: (parsedError: ParsedError, signature?: string) => {
      toast.error(parsedError.title, {
        description: (
          <TransactionToast
            signature={signature}
            status="error"
            message={parsedError.message}
            suggestion={parsedError.suggestion}
            logs={parsedError.logs}
          />
        ),
        duration: 15000,
      });
    },

    loading: (message: string = "Sending transaction...") => {
      return toast.loading(message);
    },

    dismiss: (toastId: string | number) => {
      toast.dismiss(toastId);
    },
  };
}
