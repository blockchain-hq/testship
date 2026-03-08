import type { InstructionNode, ProgramNode } from "@codama/nodes";
import {
  address,
  createSolanaRpc,
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  compileTransaction,
  getSignatureFromTransaction,
  type Address,
  type Instruction,
} from "@solana/kit";
import { buildInstructionData } from "./codama-codec";

export type TxResult = {
  signature: string;
  success: boolean;
  logs?: string[];
  error?: string;
};

export const buildInstruction = (
  instruction: InstructionNode,
  accounts: Record<string, string>,
  args: Record<string, any>,
  programAddress: string,
  programNode: ProgramNode
): Instruction => {
  const data = buildInstructionData(instruction, args, programNode);

  const accountMetas = instruction.accounts.map((acc) => ({
    address: address(accounts[acc.name] ?? ""),
    role: accountRole(acc.isSigner, acc.isWritable),
  }));

  return {
    programAddress: address(programAddress),
    accounts: accountMetas,
    data,
  } as Instruction;
};

const accountRole = (
  isSigner: boolean | "either",
  isWritable: boolean
): number => {
  if (isSigner === true && isWritable) return 3;
  if (isSigner === true) return 2;
  if (isWritable) return 1;
  return 0;
};

export const executeTransaction = async (
  ix: Instruction,
  feePayer: Address,
  rpcUrl: string,
  signTransaction: (tx: any) => Promise<any>
): Promise<TxResult> => {
  const rpc = createSolanaRpc(rpcUrl);

  const { value: latestBlockhash } = await rpc
    .getLatestBlockhash()
    .send();

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(ix, tx)
  );

  const compiled = compileTransaction(txMessage);
  const signed = await signTransaction(compiled);
  const signature = getSignatureFromTransaction(signed);

  try {
    await rpc
      .sendTransaction(signed.messageBytes, { encoding: "base64" })
      .send();

    return { signature, success: true };
  } catch (err: any) {
    return {
      signature,
      success: false,
      error: err.message ?? String(err),
    };
  }
};
