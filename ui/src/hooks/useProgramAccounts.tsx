import { queryKeys } from "@/lib/query-keys";
import { BorshAccountsCoder, type Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey, type AccountInfo } from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { extractPublicKeys } from "@/lib/utils/account-state";

export interface DecodedAccount {
  pubkey: string;
  account: {
    lamports: number;
    data: Uint8Array | string;
    owner: string;
    executable: boolean;
    rentEpoch?: number;
  };
  decoded?: unknown;
  accountType?: string;
  children?: Map<string, DecodedAccount>;
  isLoading?: boolean;
}

/**
 * Decode a single account using the provided IDL
 */
const decodeAccount = (
  pubkey: PublicKey,
  accountInfo: AccountInfo<Buffer<ArrayBufferLike>>,
  accountsCoder: BorshAccountsCoder | null,
  idl: Idl | null
): DecodedAccount => {
  const accountData: DecodedAccount = {
    pubkey: pubkey.toBase58(),
    account: {
      lamports: accountInfo.lamports,
      data: accountInfo.data as Uint8Array,
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
      rentEpoch: accountInfo.rentEpoch,
    },
    children: new Map(),
  };

  // Try to decode with each account type from IDL
  if (accountsCoder && idl?.accounts && accountInfo.data) {
    for (const accountType of idl.accounts) {
      try {
        const decoded = accountsCoder.decode(
          accountType.name,
          accountInfo.data as Buffer
        );
        accountData.decoded = decoded;
        accountData.accountType = accountType.name;
        break;
      } catch {
        // Try next account type
        continue;
      }
    }
  }

  return accountData;
};

/**
 * Fetch all accounts owned by a program
 */
const fetchProgramAccounts = async (
  connection: Connection,
  programId: PublicKey,
  idl: Idl | null
): Promise<DecodedAccount[]> => {
  const accountsData = await connection.getProgramAccounts(programId, {
    encoding: "base64",
    commitment: "confirmed",
  });

  const accountCoder = idl ? new BorshAccountsCoder(idl) : null;

  return accountsData.map(({ pubkey, account }) =>
    decodeAccount(pubkey, account, accountCoder, idl)
  );
};

/**
 * Fetch a single account by address
 */
const fetchAccount = async (
  connection: Connection,
  pubKeyStr: string,
  idl: Idl | null
): Promise<DecodedAccount | null> => {
  const pubKey = new PublicKey(pubKeyStr);
  const accountInfo = await connection.getAccountInfo(pubKey, "confirmed");

  if (!accountInfo) return null;

  const accountCoder = idl ? new BorshAccountsCoder(idl) : null;
  return decodeAccount(pubKey, accountInfo, accountCoder, idl);
};

/**
 * Recursively fetch an account and its children (referenced accounts)
 */
const fetchAccountWithChildren = async (
  connection: Connection,
  pubKeyStr: string,
  idl: Idl | null,
  maxDepth: number = 2,
  currentDepth: number = 0,
  cache: Map<string, DecodedAccount> = new Map()
): Promise<DecodedAccount | null> => {
  // Use cached result if available
  if (cache.has(pubKeyStr)) {
    return cache.get(pubKeyStr)!;
  }

  // Stop at max depth
  if (currentDepth >= maxDepth) {
    return null;
  }

  try {
    const account = await fetchAccount(connection, pubKeyStr, idl);
    if (!account) return null;

    cache.set(pubKeyStr, account);

    // Recursively fetch children if we have decoded data and haven't reached max depth
    if (account.decoded && currentDepth < maxDepth - 1) {
      const referenceKeys = extractPublicKeys(account.decoded);

      // Filter out self-references and system program
      const validChildKeys = referenceKeys.filter(
        (childKey) =>
          childKey !== pubKeyStr &&
          childKey !== "11111111111111111111111111111111"
      );

      // Fetch all children in parallel
      const childResults = await Promise.allSettled(
        validChildKeys.map(async (childKey) => {
          const childAccount = await fetchAccountWithChildren(
            connection,
            childKey,
            idl,
            maxDepth,
            currentDepth + 1,
            cache
          );
          return childAccount ? ([childKey, childAccount] as const) : null;
        })
      );

      // Add successful children to the account
      childResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          const [childKey, childAccount] = result.value;
          account.children!.set(childKey, childAccount);
        }
      });
    }

    return account;
  } catch (err) {
    console.error(`Error fetching account ${pubKeyStr}:`, err);
    return null;
  }
};

/**
 * Hook to fetch all accounts owned by a program
 */
export const useProgramAccounts = (
  connection: Connection,
  idl: Idl | null,
  cluster: { name: string; endpoint: string }
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.programAccounts(idl?.address || "", cluster.endpoint),
    queryFn: () => {
      if (!idl?.address) {
        throw new Error("IDL not loaded");
      }
      return fetchProgramAccounts(connection, new PublicKey(idl.address), idl);
    },
    enabled: !!idl?.address && !!connection,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const invalidateAccounts = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.programAccounts(idl?.address || "", cluster.endpoint),
    });
  }, [queryClient, idl?.address, cluster.endpoint]);

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
    invalidateAccounts,
  };
};

/**
 * Hook to fetch an account with its children (referenced accounts)
 */
export const useAccountWithChildren = (
  connection: Connection,
  pubkey: string | null,
  idl: Idl | null,
  cluster: { name: string; endpoint: string },
  maxDepth: number = 2
) => {
  return useQuery({
    queryKey: queryKeys.accountWithChildren(
      pubkey || "",
      cluster.endpoint,
      maxDepth
    ),
    queryFn: () => {
      if (!pubkey) {
        throw new Error("No pubkey provided");
      }
      return fetchAccountWithChildren(connection, pubkey, idl, maxDepth);
    },
    enabled: !!pubkey,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

/**
 * Hook to lazily load children for an account
 */
export const useLazyLoadChildren = (
  connection: Connection,
  idl: Idl | null,
  cluster: { name: string; endpoint: string }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pubkey,
      maxDepth = 2,
    }: {
      pubkey: string;
      maxDepth?: number;
    }) => {
      return fetchAccountWithChildren(connection, pubkey, idl, maxDepth);
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(
          queryKeys.accountWithChildren(
            variables.pubkey,
            cluster.endpoint,
            variables.maxDepth || 2
          ),
          data
        );
      }
    },
  });
};

/**
 * Hook to invalidate all account-related queries
 */
export const useInvalidateAccountQueries = (
  idl: Idl | null,
  cluster: { name: string; endpoint: string }
) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    // Invalidate program accounts
    queryClient.invalidateQueries({
      queryKey: queryKeys.programAccounts(idl?.address || "", cluster.endpoint),
    });

    // Invalidate all individual accounts
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "account" ||
        query.queryKey[0] === "accountWithChildren",
    });
  }, [queryClient, idl?.address, cluster.endpoint]);
};
