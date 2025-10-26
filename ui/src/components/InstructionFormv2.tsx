import type { IdlInstruction, ModIdlAccount } from "@/lib/types";
import type { Idl } from "@coral-xyz/anchor";
import ArgumentForm from "./instructionForm/ArgumentForm";
import AccountsFormv2 from "./instructionForm/AccountsFormv2";
import { Button, ScrollArea } from "./ui";
import { Loader2, MoveRight } from "lucide-react";
import { useInstructions } from "@/context/InstructionsContext";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { validateField } from "@/lib/validation";
import { toast } from "sonner";
import useTransaction from "@/hooks/useTransaction";
import { useAutoDerivePDAs } from "@/hooks/useAutoDerivePDAs";
import { useWallet } from "@solana/wallet-adapter-react";
import type { TransactionRecord } from "@/hooks/useTransactionHistory";
import { useSavedAccounts } from "@/context/SavedAccountsContext";
import ShareModal from "./ShareModal";

interface InstructionFormv2Props {
  instruction: IdlInstruction | null;
  idl: Idl;
  addTransaction: (transaction: TransactionRecord) => void;
}

const InstructionFormv2 = (props: InstructionFormv2Props) => {
  const { instruction, idl, addTransaction } = props;
  const { getInstructionState, updateInstructionState } = useInstructions();
  const { publicKey: userWalletPublicKey } = useWallet();

  const { execute, isExecuting } = useTransaction(addTransaction);

  const state = getInstructionState(instruction?.name ?? "");
  // local state
  const [formData, setFormData] = useState(state.formData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { addSavedAccount } = useSavedAccounts();
  const [accountsAddressMap, setAccountsAddressMap] = useState(
    state.accountsAddresses
  );
  const [signersKeypairs, setSignersKeypairs] = useState(state.signersKeypairs);

  const derivedPDAs = useAutoDerivePDAs(
    instruction,
    idl,
    formData,
    accountsAddressMap
  );

  useEffect(() => {
    derivedPDAs.forEach((pda, accountName) => {
      if (pda.status === "ready" && pda.address) {
        setAccountsAddressMap((prev) => {
          const current = prev.get(accountName);

          if (current !== pda.address) {
            const newMap = new Map(prev);
            newMap.set(accountName, pda.address);
            return newMap;
          }
          return prev;
        });
      }
    });
  }, [derivedPDAs]);

  const initializeSignerAccounts = useCallback(
    (instruction: IdlInstruction) => {
      if (!userWalletPublicKey || !instruction.accounts) return new Map();

      const accountsMap = new Map<string, string | null>();
      instruction.accounts.forEach((account: ModIdlAccount) => {
        if (account.signer) {
          accountsMap.set(account.name, userWalletPublicKey.toBase58());
        } else if (account.address) {
          accountsMap.set(account.name, account.address);
        }
      });
      return accountsMap;
    },
    [userWalletPublicKey]
  );

  useEffect(() => {
    const newState = getInstructionState(instruction?.name ?? "");
    setFormData(newState.formData);
    setSignersKeypairs(newState.signersKeypairs);

    // if signers keypairs are empty, set user wallet as signer
    if (newState.accountsAddresses.size === 0 && instruction) {
      setAccountsAddressMap(initializeSignerAccounts(instruction));
    } else {
      setAccountsAddressMap(newState.accountsAddresses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instruction?.name]);

  // debounced update to global state
  useEffect(() => {
    if (!instruction?.name) return;

    const timeout = setTimeout(() => {
      updateInstructionState(instruction?.name ?? "", {
        formData,
        accountsAddresses: accountsAddressMap,
        signersKeypairs,
      });
    }, 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, instruction?.name, accountsAddressMap, signersKeypairs]);

  // validate all fields
  const validateAllFields = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    instruction?.accounts.forEach((account) => {
      const value = accountsAddressMap.get(account.name);
      const error = validateField(account.name, value);
      if (error) {
        errors[account.name] = error;
        isValid = false;
      }
    });

    instruction?.args.forEach((arg) => {
      const value = formData[arg.name];
      const error = validateField(arg.name, value, arg.type);
      if (error) {
        errors[arg.name] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isExecuting) return;

    if (!validateAllFields()) {
      toast.error("Please fix the errors above");
      return;
    }

    if (!instruction) return;

    const result = await execute(
      instruction,
      accountsAddressMap,
      formData,
      signersKeypairs
    );

    if (result) {
      // save the saved accounts
      accountsAddressMap.forEach((address, name) => {
        if (!address) return;
        addSavedAccount({
          accountName: name,
          address,
          instructionName: instruction.name,
          programId: idl.address,
          timestamp: Date.now(),
        });
      });
    }
  };

  if (!instruction) return null;

  return (
    <form
      className="w-full max-w-[800px] bg-card border border-border/50 rounded-md p-4 space-y-8"
      id="instruction-form"
      onSubmit={handleSubmit}
    >
      <ScrollArea className="h-[60vh] rounded-md overflow-hidden">
        <div className="space-y-4">
          <ArgumentForm
            args={instruction.args ?? null}
            formData={formData}
            onChange={setFormData}
            validationErrors={validationErrors}
          />
          <AccountsFormv2
            accounts={instruction.accounts ?? null}
            accountsAddressMap={accountsAddressMap}
            onAccountChange={setAccountsAddressMap}
            signersKeypairs={signersKeypairs}
            onSignerChange={setSignersKeypairs}
            validationErrors={validationErrors}
            formData={formData}
            derivedPDAs={derivedPDAs}
          />
        </div>
      </ScrollArea>

      <div className="flex flex-row justify-end items-center gap-2">
        <ShareModal />

        <Button
          disabled={isExecuting}
          id="run-instruction-btn"
          type="submit"
          className=" transition-[width,transform,opacity] duration-300 ease-in-out"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Running...
            </>
          ) : (
            <>
              <MoveRight />
              Run Instruction
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default InstructionFormv2;
