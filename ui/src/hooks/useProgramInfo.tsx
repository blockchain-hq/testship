import { useIDL } from "@/context/IDLContext";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

type ProgramInfo = {
  name: string;
  version: string;
  description: string;
  deployed: boolean;
  owner: string | null;
  lamports: number;
  upgradeAuthority: string | null;
};

const useProgramInfo = () => {
  const { idl } = useIDL();
  const { connection } = useConnection();
  const [programInfo, setProgramInfo] = useState<ProgramInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgramInfo = async () => {
      if (!idl) {
        setProgramInfo(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const programId = new PublicKey(idl.address);
        const accountInfo = await connection.getAccountInfo(programId);

        let upgradeAuthority: string | null = null;

        if (accountInfo && accountInfo.executable) {
          try {
            const [programDataAddress] = PublicKey.findProgramAddressSync(
              [programId.toBuffer()],
              new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
            );

            const programDataAccount = await connection.getAccountInfo(
              programDataAddress
            );

            if (programDataAccount) {
              // Bytes 0-4: Discriminator
              // Bytes 5-8: Slot deployed
              // Bytes 9-40: Upgrade authority (32 bytes pubkey)
              const authorityBytes = programDataAccount.data.slice(13, 45);
              upgradeAuthority = new PublicKey(authorityBytes).toBase58();
            }
          } catch (err) {
            console.warn("Could not fetch upgrade authority:", err);
          }
        }

        if (accountInfo && accountInfo.executable) {
          setProgramInfo({
            name: idl.metadata.name,
            version: idl.metadata.version,
            description: idl.metadata.description || "",
            deployed: true,
            owner: accountInfo.owner.toBase58(),
            lamports: accountInfo.lamports,
            upgradeAuthority,
          });
        } else {
          setProgramInfo({
            name: idl.metadata.name,
            version: idl.metadata.version,
            description: idl.metadata.description || "",
            deployed: false,
            owner: null,
            lamports: 0,
            upgradeAuthority: null,
          });
        }
      } catch (error) {
        console.error("Error fetching program info:", error);
        setError("Failed to fetch program info");
        setProgramInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramInfo();
  }, [idl, connection]);

  return { programInfo, isLoading, error };
};

export default useProgramInfo;
