import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useState } from "react";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMint,
  getAccount,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
} from "@solana/web3.js";

interface TokenInfo {
  mint: string;
  decimals: number;
  tokenAccount?: string;
  balance?: string;
}

export const useSPLToken = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createToken = useCallback(
    async (decimals: number) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        // Generate a new keypair for the mint
        const mintKeypair = Keypair.generate();

        // Calculate minimum lamports for rent exemption
        const lamports = await connection.getMinimumBalanceForRentExemption(
          MINT_SIZE
        );

        // Build transaction
        const transaction = new Transaction().add(
          // Create account for the mint
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          // Initialize the mint
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            wallet.publicKey,
            wallet.publicKey,
            TOKEN_PROGRAM_ID
          )
        );

        // Send and confirm transaction
        const signature = await wallet.sendTransaction(
          transaction,
          connection,
          {
            signers: [mintKeypair],
          }
        );

        await connection.confirmTransaction(signature, "confirmed");

        return mintKeypair.publicKey.toBase58();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create token";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const mintTokens = useCallback(
    async (mintAddress: string, destinationAddress: string, amount: number) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const mint = new PublicKey(mintAddress);
        const destination = new PublicKey(destinationAddress);

        // Get mint info to determine decimals
        const mintInfo = await getMint(connection, mint);
        const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

        // Get or create associated token account
        const destinationATA = await getAssociatedTokenAddress(
          mint,
          destination
        );

        const transaction = new Transaction();

        // Check if ATA exists, if not create it
        const accountInfo = await connection.getAccountInfo(destinationATA);
        if (!accountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              destinationATA,
              destination,
              mint
            )
          );
        }

        // Add mint instruction
        transaction.add(
          createMintToInstruction(
            mint,
            destinationATA,
            wallet.publicKey,
            amountWithDecimals
          )
        );

        // Send transaction
        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");

        return signature;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to mint tokens";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const transferTokens = useCallback(
    async (mintAddress: string, destinationAddress: string, amount: number) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const mint = new PublicKey(mintAddress);
        const destination = new PublicKey(destinationAddress);

        // Get mint info to determine decimals
        const mintInfo = await getMint(connection, mint);
        const amountWithDecimals = amount * Math.pow(10, mintInfo.decimals);

        // Get source and destination ATAs
        const sourceATA = await getAssociatedTokenAddress(
          mint,
          wallet.publicKey
        );
        const destinationATA = await getAssociatedTokenAddress(
          mint,
          destination
        );

        const transaction = new Transaction();

        // Check if destination ATA exists, if not create it
        const accountInfo = await connection.getAccountInfo(destinationATA);
        if (!accountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              destinationATA,
              destination,
              mint
            )
          );
        }

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            sourceATA,
            destinationATA,
            wallet.publicKey,
            amountWithDecimals
          )
        );

        // Send transaction
        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");

        return signature;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to transfer tokens";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet]
  );

  const getTokenInfo = useCallback(
    async (mintAddress: string): Promise<TokenInfo> => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const mint = new PublicKey(mintAddress);

        // Get mint info
        const mintInfo = await getMint(connection, mint);

        try {
          // Get user's token account
          const tokenAccount = await getAssociatedTokenAddress(
            mint,
            wallet.publicKey
          );

          const accountInfo = await getAccount(connection, tokenAccount);
          const balance =
            Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);

          return {
            mint: mintAddress,
            decimals: mintInfo.decimals,
            tokenAccount: tokenAccount.toBase58(),
            balance: balance.toString(),
          };
        } catch (error) {
          // Account doesn't exist
          console.error("Token account not found:", error);
          return {
            mint: mintAddress,
            decimals: mintInfo.decimals,
            tokenAccount: undefined,
            balance: "0",
          };
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get token info";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet.publicKey]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createToken,
    mintTokens,
    transferTokens,
    getTokenInfo,
    clearError,
    loading,
    error,
  };
};
