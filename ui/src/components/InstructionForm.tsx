import React, { useState, type FormEvent } from "react";
import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
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
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet, {
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
        .accounts(accountPubKeyMap)
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

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
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
    <Card className="w-full bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground dark:text-foreground-dark">
          <span>⚡</span>
          <span>{instruction.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Accounts Section */}
          {instruction.accounts && instruction.accounts.length > 0 && (
            <div className="space-y-3">
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
      </CardContent>
    </Card>
  );
};

export default InstructionForm;
