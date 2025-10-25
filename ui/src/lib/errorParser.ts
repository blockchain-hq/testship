import type { AnchorError } from "@coral-xyz/anchor";

export interface ParsedError {
  title: string;
  message: string;
  logs?: string[];
  suggestion?: string;
}

export interface ErrorWithLogs extends Error {
  logs?: string[];
  getLogs?: () => string[];
}

export function parseSolanaError(
  error: Error | AnchorError | ErrorWithLogs
): ParsedError {
  const errorMessage = (error as Error)?.message || String(error);

  let logs: string[] = [];
  const errorWithLogs = error as ErrorWithLogs;

  if (errorWithLogs?.logs) {
    logs = errorWithLogs.logs;
  } else if (typeof errorWithLogs?.getLogs === "function") {
    try {
      logs = errorWithLogs.getLogs();
    } catch {
      // getLogs() failed, continue without logs
    }
  }

  if (errorMessage.includes("program that does not exist")) {
    return {
      title: "Program Not Found",
      message:
        "The program you're trying to call doesn't exist on this cluster.",
      logs,
      suggestion:
        "Make sure:\n• Your local validator is running (solana-test-validator)\n• The program is deployed\n• You're using the correct program ID",
    };
  }

  if (
    errorMessage.includes("insufficient funds") ||
    logs.some((l) => l.includes("insufficient funds"))
  ) {
    return {
      title: "Insufficient Funds",
      message: "Your wallet doesn't have enough SOL for this transaction.",
      logs,
      suggestion: "Airdrop some SOL: solana airdrop 2",
    };
  }

  if (
    errorMessage.includes("AccountNotFound") ||
    errorMessage.includes("could not find account")
  ) {
    return {
      title: "Account Not Found",
      message:
        "One or more accounts required for this instruction don't exist yet.",
      logs,
      suggestion: "Make sure all required accounts are initialized first.",
    };
  }

  const customErrorMatch = errorMessage.match(
    /custom program error: (0x[0-9a-f]+)/i
  );
  if (customErrorMatch) {
    const errorCode = customErrorMatch[1];
    return {
      title: "Program Error",
      message: `The program returned an error (${errorCode}).`,
      logs,
      suggestion: "Check the program's error codes to see what went wrong.",
    };
  }

  if (
    errorMessage.includes("Invalid public key input") ||
    errorMessage.includes("invalid public key")
  ) {
    return {
      title: "Invalid Address",
      message:
        "One of the addresses provided is not a valid Solana public key.",
      logs,
      suggestion:
        "Check that all addresses are correct and properly formatted.",
    };
  }

  if (errorMessage.includes("signature verification failed")) {
    return {
      title: "Signature Failed",
      message: "The transaction signature verification failed.",
      logs,
      suggestion: "Make sure you have the correct signer keypairs.",
    };
  }

  if (errorMessage.includes("Blockhash not found")) {
    return {
      title: "Transaction Expired",
      message: "The transaction blockhash has expired.",
      logs,
      suggestion: "Try submitting the transaction again.",
    };
  }

  if (
    errorMessage.includes("wallet") &&
    errorMessage.includes("not connected")
  ) {
    return {
      title: "Wallet Not Connected",
      message: "Please connect your wallet before executing transactions.",
      logs,
    };
  }

  if (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError")
  ) {
    return {
      title: "Network Error",
      message: "Unable to connect to the Solana network.",
      logs,
      suggestion:
        "Check your internet connection and make sure the validator is running.",
    };
  }

  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return {
      title: "Transaction Timeout",
      message: "The transaction took too long to process.",
      logs,
      suggestion: "The network might be congested. Try again.",
    };
  }

  if (logs.length > 0) {
    const logsText = logs.join("\n").toLowerCase();

    if (logsText.includes("already in use")) {
      return {
        title: "Account Already Exists",
        message: "An account you're trying to create already exists.",
        logs,
        suggestion:
          "Use a different account or check if it's already initialized.",
      };
    }

    if (logsText.includes("overflow")) {
      return {
        title: "Arithmetic Overflow",
        message: "A calculation in the program resulted in an overflow.",
        logs,
        suggestion: "Check your input values - they might be too large.",
      };
    }

    if (
      logsText.includes("access violation") ||
      logsText.includes("privilege")
    ) {
      return {
        title: "Access Violation",
        message: "The program tried to perform an unauthorized operation.",
        logs,
        suggestion: "Make sure you're using the correct signer account.",
      };
    }
  }

  if (errorMessage.includes("Simulation failed")) {
    return {
      title: "Transaction Simulation Failed",
      message: "The transaction would fail if submitted to the network.",
      logs,
      suggestion:
        logs.length > 0
          ? "Check the logs below for details."
          : "Make sure all accounts are initialized and you have the correct permissions.",
    };
  }

  return {
    title: "Transaction Failed",
    message: errorMessage,
    logs,
  };
}

export function formatLogs(logs: string[]): string {
  if (!logs || logs.length === 0) return "";

  return logs.map((log, i) => `${i + 1}. ${log}`).join("\n");
}
