import React, { useState, type FormEvent } from "react";
import { type Idl } from "@coral-xyz/anchor";
import type { IdlField, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
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
import type { ModIdlAccount } from "@/lib/types";
import { Keypair } from "@solana/web3.js";
import UseSavedAccounts from "@/hooks/useSavedAccounts";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import useTransaction from "@/hooks/useTransaction";
import { validateField } from "@/lib/validation";
import type { TransactionRecord } from "@/hooks/useTransactionHistory";
import ShareModal from "./ShareModal";

interface InstructionFormProps {
  instruction: Idl["instructions"][number];
  idl: Idl;
  addTransactionRecord: (tx: TransactionRecord) => void;
  accountMapFromState: Map<string, string | null> | null;
}

const InstructionForm = (props: InstructionFormProps) => {
  const { instruction, idl, addTransactionRecord, accountMapFromState } = props;
  
  // Create a unique key for this instruction's form data
  const formDataKey = `testship_form_${instruction.name}`;
  
  // Load form data from localStorage on component mount
  const [formData, setFormData] = React.useState<
    Record<string, string | number>
  >(() => {
    try {
      const saved = localStorage.getItem(formDataKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  });
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});
  const { addSavedAccount, savedAccounts } = UseSavedAccounts();
  const { execute, isExecuting } = useTransaction(idl, addTransactionRecord);

  React.useEffect(() => {
    const hasData = Object.values(formData).some(value => 
      value !== "" && value !== undefined && value !== null
    );
    
    if (hasData) {
      try {
        localStorage.setItem(formDataKey, JSON.stringify(formData));
      } catch (error) {
        console.warn("Failed to save form data to localStorage:", error);
      }
    }
  }, [formData, formDataKey]);

  const clearFormData = () => {
    setFormData({});
    try {
      localStorage.removeItem(formDataKey);
    } catch (error) {
      console.warn("Failed to clear arguments data from localStorage:", error);
    }

    const newAccountsMap = new Map<string, string | null>();
    instruction.accounts.forEach((account: ModIdlAccount) => {
      newAccountsMap.set(account.name, account.address || null);
    });
    setAccountsAddressMap(newAccountsMap);
    
    try {
      const accountsDataKey = `testship_accounts_${instruction.name}`;
      localStorage.removeItem(accountsDataKey);
    } catch (error) {
      console.warn("Failed to clear accounts data from localStorage:", error);
    }
  };

  const [accountsAddressMap, setAccountsAddressMap] = useState(() =>
    accountMapFromState
      ? new Map(accountMapFromState)
      : new Map<string, string | null>(
          instruction.accounts.map((account: ModIdlAccount) => [
            account.name,
            account.address || null,
          ])
        )
  );

  const [signersKeypairs, setSignersKeypairs] = useState<Map<string, Keypair>>(
    () => new Map<string, Keypair>()
  );

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
      const error = validateField(arg.name, value, arg.type);
      if (error) {
        errors[arg.name] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleInputChange = (name: string, value: unknown) => {
    const convertedValue = value === undefined ? "" : (typeof value === "boolean" ? String(value) : value as string | number);
    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue
    }));

    const arg = instruction.args?.find((arg) => arg.name === name);
    const argType = arg?.type;

    const error = validateField(name, value, argType);
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
    if (isExecuting) return;

    if (!validateAllFields()) {
      toast.error("Please fix the errors above");
      return;
    }

    const result = await execute(
      instruction,
      accountsAddressMap,
      formData,
      signersKeypairs
    );

    if (result) {
      for (const [name, address] of result.accounts) {
        if (address) {
          addSavedAccount({
            accountName: name,
            address,
            instructionName: instruction.name,
            programId: idl.address,
            timestamp: Date.now(),
          });
        }
      }
    }
  };

  const renderInput = (arg: IdlField) => {
    const type = deriveType(arg.type);
    const value: unknown = formData[arg.name] ?? "";

    switch (type) {
      case "number": {
        const getNumberConstraints = (type: IdlType) => {
          if (typeof type === "string") {
            switch (type) {
              case "u8":
                return { min: 0, max: 255, step: 1 };
              case "u16":
                return { min: 0, max: 65535, step: 1 };
              case "u32":
                return { min: 0, max: 4294967295, step: 1 };
              case "u64":
                return { min: 0, max: Number.MAX_SAFE_INTEGER, step: 1 };
              case "i8":
                return { min: -128, max: 127, step: 1 };
              case "i16":
                return { min: -32768, max: 32767, step: 1 };
              case "i32":
                return { min: -2147483648, max: 2147483647, step: 1 };
              case "i64":
                return {
                  min: Number.MIN_SAFE_INTEGER,
                  max: Number.MAX_SAFE_INTEGER,
                  step: 1,
                };
              default:
                return { step: 1 };
            }
          }
          return { step: 1 };
        };

        const constraints = getNumberConstraints(arg.type);
        return (
          <Input
            type="number"
            id={arg.name}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => {
              const inputValue = e.target.value;
              // Convert empty string to undefined, otherwise convert to number
              const numericValue =
                inputValue === "" ? undefined : Number(inputValue);
              handleInputChange(arg.name, numericValue);
            }}
            placeholder={`Enter ${arg.name} (${
              typeof arg.type === "string" ? arg.type : "number"
            })`}
            className="bg-input dark:bg-input-dark border-input-border dark:border-input-border-dark text-foreground dark:text-foreground-dark"
            min={constraints.min}
            max={constraints.max}
            step={constraints.step}
          />
        );
      }
      case "boolean":
        return (
          <Select
            value={value === "" ? "true" : String(value)}
            onValueChange={(val) => {
              handleInputChange(arg.name, val === "true");
            }}
          >
            <SelectTrigger className="bg-input dark:bg-input-dark border-input-border dark:border-input-border-dark text-foreground dark:text-foreground-dark">
              <SelectValue placeholder={`Select ${arg.name} (boolean)`} />
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
            value={value as string}
            onChange={(e) => {
              handleInputChange(arg.name, e.target.value);
            }}
            placeholder={`Enter ${arg.name} (${
              typeof arg.type === "string" ? arg.type : "string"
            })`}
            rows={3}
            className="bg-input dark:bg-input-dark border-input-border dark:border-input-border-dark text-foreground dark:text-foreground-dark"
          />
        );
    }
  };

  return (
    <div className="w-full max-w-[800px] bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
      <div className="w-full">
        <Toaster />

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
                idl={idl}
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
          <div className="flex justify-end pt-4 gap-2">
            <ShareModal
              idl={idl}
              accountMap={accountsAddressMap}
              formData={formData}
              instructions={[instruction]}
              key={instruction.name}
            />
            <Button
              type="button"
              variant="outline"
              onClick={clearFormData}
              disabled={isExecuting}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isExecuting}
              className="min-w-32 bg-accent-primary hover:bg-accent-primary/90 text-primary border border-primary disabled:opacity-50"
            >
              {isExecuting ? "Running..." : "Run Instruction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructionForm;
