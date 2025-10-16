import React, { useState, type FormEvent } from "react";
import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import AccountsForm from "./accounts/AccountsForm";
import {
  useAnchorWallet,
  useConnection,
  type AnchorWallet,
} from "@solana/wallet-adapter-react";
import type { ModIdlAccount } from "@/lib/types";
import { Keypair, PublicKey } from "@solana/web3.js";
import UseSavedAccounts from "@/hooks/useSavedAccounts";

interface InstructionFormProps {
  instruction: Idl["instructions"][number];
  idl: Idl;
}

const InstructionForm = (props: InstructionFormProps) => {
  const { instruction, idl } = props;
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: "confirmed",
  });
  const { addSavedAccount, savedAccounts } = UseSavedAccounts();

  const [accountsAddressMap, setAccountsAddressMap] = useState(
    () =>
      new Map<string, string | null>(
        instruction.accounts.map((account: ModIdlAccount) => [
          account.name,
          account.address || null,
        ])
      )
  );

  const [signersKeypairs, setSignersKeypairs] = useState<Map<string, Keypair>>(
    () => new Map<string, Keypair>()
  );

  const handleExecuteInstruction = async (
    instructionName: string,
    accounts: Map<string, string | null>
  ) => {
    console.log("Executing instruction:", instructionName);
    console.log("Accounts:", accounts);
    try {
      if (!idl)
        throw new Error("IDL not load, please load IDL for the program.");

      const program = new Program(idl, provider);
      console.log("Program:", program);

      const accountPubKeyMap = Object.fromEntries(
        Array.from(accounts.entries()).map(([name, address]) => [
          name,
          address ? new PublicKey(address) : null,
        ])
      );

      const tx = await program.methods[instructionName]()
        .accounts(accountPubKeyMap as any)
        .signers(Array.from(signersKeypairs.values()))
        .rpc();

      console.log("Transaction signature:", tx);
      alert(
        `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      );

      // save accounts
      Object.entries(accountPubKeyMap).forEach(([name, pubKey]) => {
        if (!pubKey) return;

        addSavedAccount({
          accountName: name,
          address: pubKey.toBase58(),
          instructionName: instructionName,
          programId: idl.address,
          timestamp: new Date().getTime(),
        });
      });
    } catch (error) {
      console.error("Error executing instruction:", error);
      throw error;
    }
  };

  const deriveType = (type: IdlType): string => {
    if (typeof type === "string") {
      switch (type) {
        case "u8":
        case "u16":
        case "u32":
        case "u64":
        case "i8":
        case "i16":
        case "i32":
        case "i64":
          return "number";
        case "bool":
          return "boolean";
        default:
          return "string";
      }
    }
    return "string";
  };

  const validateField = (name: string, value: any): string | null => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${name} is required`;
    }
    return null;
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate accounts
    instruction.accounts.forEach((account) => {
      const value = accountsAddressMap.get(account.name);
      const error = validateField(account.name, value);
      if (error) {
        errors[account.name] = error;
        isValid = false;
      }
    });

    // Validate arguments
    instruction.args?.forEach((arg) => {
      const value = formData[arg.name];
      const error = validateField(arg.name, value);
      if (error) {
        errors[arg.name] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    const error = validateField(name, value);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields before submission
    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock submission - replace with actual API call
      handleExecuteInstruction(instruction.name, accountsAddressMap);
    } catch (error) {
      console.error("Error submitting instruction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (arg: any) => {
    const type = deriveType(arg.type);
    const value = formData[arg.name] || "";

    switch (type) {
      case "number":
        return (
          <Input
            type="number"
            id={arg.name}
            value={value}
            onChange={(e) =>
              handleInputChange(arg.name, Number(e.target.value))
            }
            placeholder={`Enter ${arg.name}`}
            className="bg-input dark:bg-input-dark border-input-border dark:border-input-border-dark text-foreground dark:text-foreground-dark"
          />
        );
      case "boolean":
        return (
          <Select
            value={value.toString()}
            onValueChange={(val) => handleInputChange(arg.name, val === "true")}
          >
            <SelectTrigger className="bg-input dark:bg-input-dark border-input-border dark:border-input-border-dark text-foreground dark:text-foreground-dark">
              <SelectValue placeholder="Select boolean value" />
            </SelectTrigger>
            <SelectContent className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Textarea
            id={arg.name}
            value={value}
            onChange={(e) => handleInputChange(arg.name, e.target.value)}
            placeholder={`Enter ${arg.name}`}
            rows={3}
            className="bg-input dark:bg-input-dark border-input-border dark:border-input-border-dark text-foreground dark:text-foreground-dark"
          />
        );
    }
  };

  return (
    <div className="w-full max-w-[800px] bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-full justify-start"
        >
          {/* Accounts Section */}
          {instruction.accounts && instruction.accounts.length > 0 && (
            <div className="space-y-3 flex flex-col w-full justify-start">
              <h4 className="text-sm font-medium text-foreground dark:text-foreground-dark">
                Accounts
              </h4>
              <AccountsForm
                instruction={instruction}
                accountsMap={accountsAddressMap}
                setAccountsMap={setAccountsAddressMap}
                signersKeypairs={signersKeypairs}
                setSignersKeypairs={setSignersKeypairs}
                savedAccounts={savedAccounts}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
                formData={formData}
                programId={idl.address}
              />
            </div>
          )}

          {/* Arguments Section */}
          {instruction.args && instruction.args.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground dark:text-foreground-dark">
                Arguments
              </h4>
              {instruction.args.map((arg) => (
                <div key={arg.name} className="space-y-2">
                  <Label
                    htmlFor={arg.name}
                    className="text-foreground dark:text-foreground-dark"
                  >
                    {arg.name}{" "}
                    <span className="text-foreground/50 dark:text-foreground-dark/50">
                      ({typeof arg.type === "string" ? arg.type : "object"})
                    </span>
                  </Label>
                  {validationErrors[arg.name] && (
                    <p className="text-red-500 text-sm">
                      {validationErrors[arg.name]}
                    </p>
                  )}
                  {renderInput(arg)}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-32 bg-accent-primary hover:bg-accent-primary/90 text-primary border border-primary disabled:opacity-50"
            >
              {isSubmitting ? "Running..." : "Run Instruction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructionForm;
