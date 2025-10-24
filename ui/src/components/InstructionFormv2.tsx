import type { IdlInstruction } from "@/lib/types";
import type { Idl } from "@coral-xyz/anchor";
import ArgumentForm from "./instructionForm/ArgumentForm";
import AccountsFormv2 from "./instructionForm/AccountsFormv2";
import { Button, ScrollArea } from "./ui";
import { MoveRight, Share } from "lucide-react";
import { useInstructions } from "@/context/InstructionsContext";
import { useEffect, useState, type FormEvent } from "react";
import { validateField } from "@/lib/validation";
import { toast } from "sonner";
import useTransaction from "@/hooks/useTransaction";

interface InstructionFormv2Props {
  instruction: IdlInstruction | null;
  idl: Idl;
}

const InstructionFormv2 = (props: InstructionFormv2Props) => {
  const { instruction, idl } = props;
  const { getInstructionState, updateInstructionState } = useInstructions();
  const { execute, isExecuting } = useTransaction(idl, () => {});

  const state = getInstructionState(instruction?.name ?? "");
  // local state
  const [formData, setFormData] = useState(state.formData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [accountsAddressMap, setAccountsAddressMap] = useState(
    state.accountsAddresses
  );
  const [signersKeypairs, setSignersKeypairs] = useState(state.signersKeypairs);

  // Sync local state with context state when instruction changes
  useEffect(() => {
    setFormData(state.formData);
    setAccountsAddressMap(state.accountsAddresses);
    setSignersKeypairs(state.signersKeypairs);
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
      toast.success("Instruction executed successfully");
      // TODO: add accounts to saved accounts
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
          />
        </div>
      </ScrollArea>

      <div className="flex flex-row justify-end items-center gap-2">
        <Button
          variant="outline"
          type="button"
          className="bg-level-4-primary hover:bg-level-4-primary/90 text-white shadow-lg shadow-level-4-primary/30 hover:shadow-xl hover:shadow-level-4-primary/50  transition-all"
        >
          <Share />
        </Button>

        <Button
          disabled={isExecuting}
          className="bg-level-4-primary hover:bg-level-4-primary/90 text-white shadow-lg shadow-level-4-primary/30 hover:shadow-xl hover:shadow-level-4-primary/50  transition-all"
          id="run-instruction-btn"
          type="submit"
        >
          <MoveRight />
          Run Instruction
        </Button>
      </div>
    </form>
  );
};

export default InstructionFormv2;
