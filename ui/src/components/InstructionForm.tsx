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
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { toCamelCase } from "@/lib/utils";
import { convertArgValue } from "@/lib/pdaUtils";

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
  const [submitError, setSubmitError] = React.useState<string | null>(null);
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
    console.log("=== DEBUG START ===");
    console.log("Accounts Map:", accounts);
    console.log("Accounts Map entries:", Array.from(accounts.entries()));
    console.log("poll_authority value:", accounts.get("poll_authority"));
    console.log("=== DEBUG END ===");
    try {
      if (!idl)
        throw new Error("IDL not load, please load IDL for the program.");

      const program = new Program(idl, provider);

      const accountPubKeyMap = Object.fromEntries(
        Array.from(accounts.entries()).map(([name, address]) => [
          toCamelCase(name),
          address ? new PublicKey(address) : null,
        ])
      );

      console.log("=== AFTER CONVERSION ===");
      console.log("accountPubKeyMap:", accountPubKeyMap);
      console.log("pollAuthority value:", accountPubKeyMap.pollAuthority);
      console.log("=== CONVERSION END ===");

      const args = instruction.args.map((arg) => {
        const value = formData[arg.name];
        if (value === undefined || value === null) {
          throw Error(`Argument ${arg.name} is required.`);
        }

        if (typeof value === "string" && value.trim() === "") {
          throw Error(`Argument ${arg.name} is required.`);
        }

        return convertArgValue(value, arg.type);
      });

      console.log(args, "arguments");

      const tx = await program.methods[toCamelCase(instructionName)](...args)
        .accounts(accountPubKeyMap as any)
        .signers(Array.from(signersKeypairs.values()))
        .rpc();

      console.log("Transaction signature:", tx);
      alert(
        `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      );
      toast.success(`Instruction ${instructionName} executed successfully`);
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
      if (error instanceof Error) {
        if (error.message.includes("Invalid public key input")) {
          throw new Error(
            "One or more account addresses are invalid. Please check that all addresses are valid Solana public keys."
          );
        } else if (
          error.message.includes("must be a valid Solana public key")
        ) {
          throw error;
        } else if (error.message.includes("address is required")) {
          throw error;
        } else {
          throw new Error(`Failed to execute instruction: ${error.message}`);
        }
      }

      throw new Error(
        "An unexpected error occurred while executing the instruction."
      );
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

  const isValidSolanaPublicKey = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = (
    name: string,
    value: any,
    type?: IdlType
  ): string | null => {
    // Allow 0, false, and other falsy values except null/undefined
    if (value === null || value === undefined) {
      return `${name} is required`;
    }

    // For strings, check for empty or whitespace-only
    if (typeof value === "string" && value.trim() === "") {
      return `${name} is required`;
    }

    // If no type specified (accounts), validate as PublicKey
    if (!type) {
      if (typeof value === "string" && value.trim() !== "") {
        if (!isValidSolanaPublicKey(value.trim())) {
          return `${name} must be a valid Solana public key`;
        }
      }
      return null;
    }

    // Type-specific validation for arguments
    if (typeof type === "string") {
      switch (type) {
        case "u8": {
          const u8Value = Number(value);
          if (
            isNaN(u8Value) ||
            !Number.isInteger(u8Value) ||
            u8Value < 0 ||
            u8Value > 255
          ) {
            return `${name} must be a valid u8 (0-255)`;
          }
          break;
        }
        case "u16": {
          const u16Value = Number(value);
          if (
            isNaN(u16Value) ||
            !Number.isInteger(u16Value) ||
            u16Value < 0 ||
            u16Value > 65535
          ) {
            return `${name} must be a valid u16 (0-65535)`;
          }
          break;
        }
        case "u32": {
          const u32Value = Number(value);
          if (
            isNaN(u32Value) ||
            !Number.isInteger(u32Value) ||
            u32Value < 0 ||
            u32Value > 4294967295
          ) {
            return `${name} must be a valid u32 (0-4294967295)`;
          }
          break;
        }
        case "u64": {
          const u64Value = Number(value);
          if (
            isNaN(u64Value) ||
            !Number.isInteger(u64Value) ||
            u64Value < 0 ||
            u64Value > Number.MAX_SAFE_INTEGER
          ) {
            return `${name} must be a valid u64 (0-${Number.MAX_SAFE_INTEGER})`;
          }
          break;
        }
        case "i8": {
          const i8Value = Number(value);
          if (
            isNaN(i8Value) ||
            !Number.isInteger(i8Value) ||
            i8Value < -128 ||
            i8Value > 127
          ) {
            return `${name} must be a valid i8 (-128 to 127)`;
          }
          break;
        }
        case "i16": {
          const i16Value = Number(value);
          if (
            isNaN(i16Value) ||
            !Number.isInteger(i16Value) ||
            i16Value < -32768 ||
            i16Value > 32767
          ) {
            return `${name} must be a valid i16 (-32768 to 32767)`;
          }
          break;
        }
        case "i32": {
          const i32Value = Number(value);
          if (
            isNaN(i32Value) ||
            !Number.isInteger(i32Value) ||
            i32Value < -2147483648 ||
            i32Value > 2147483647
          ) {
            return `${name} must be a valid i32 (-2147483648 to 2147483647)`;
          }
          break;
        }
        case "i64": {
          const i64Value = Number(value);
          if (
            isNaN(i64Value) ||
            !Number.isInteger(i64Value) ||
            i64Value < Number.MIN_SAFE_INTEGER ||
            i64Value > Number.MAX_SAFE_INTEGER
          ) {
            return `${name} must be a valid i64 (${Number.MIN_SAFE_INTEGER} to ${Number.MAX_SAFE_INTEGER})`;
          }
          break;
        }
        case "bool":
          if (
            typeof value !== "boolean" &&
            value !== "true" &&
            value !== "false"
          ) {
            return `${name} must be a valid boolean (true or false)`;
          }
          break;
        default:
          break;
      }
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
      const error = validateField(arg.name, value, arg.type);
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
    if (isSubmitting) return;

    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await handleExecuteInstruction(instruction.name, accountsAddressMap);
    } catch (error) {
      console.error("Error submitting instruction:", error);
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError(
          "An unexpected error occurred while executing the instruction."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (arg: any) => {
    const type = deriveType(arg.type);
    const value = formData[arg.name] ?? "";

    switch (type) {
      case "number":
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
            value={value}
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
      case "boolean":
        return (
          <Select
            value={value.toString()}
            onValueChange={(val) => handleInputChange(arg.name, val === "true")}
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
            value={value}
            onChange={(e) => handleInputChange(arg.name, e.target.value)}
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

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {submitError}
              </p>
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
