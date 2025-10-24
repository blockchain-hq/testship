import { useEffect, useState } from "react";
import { type Idl } from "@coral-xyz/anchor";
import { useWebSocket } from "./useWebSocket";

const UseIdl = () => {
  const [idl, setIdl] = useState<Idl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchIdl = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/idl");
      const data = await response.json();

      setIdl(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    url: "ws://localhost:3000",
    onMessage: (message) => {
      if (message === "IDL_UPDATED") {
        console.log("IDL updated, refreshing...");
        fetchIdl();
      }
    },
    onOpen: () => {
      console.log("Connected to Testship WebSocket");
    },
    onClose: () => {
      console.log("Disconnected from Testship WebSocket");
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  useEffect(() => {
    const hasHash = window.location.hash.includes("#status=");

    if (!hasHash) {
      fetchIdl();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    idl,
    error,
    isLoading: loading,
    fetchIdl,
    setIdl,
    isWebSocketConnected: isConnected,
  };
};

export default UseIdl;
