import { useEffect, useState, useRef } from "react";
import { type Idl } from "@coral-xyz/anchor";
import { useWebSocket } from "./useWebSocket";

const UseIdl = () => {
  const [idl, setIdl] = useState<Idl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced refresh function
  const debouncedRefresh = () => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      console.log("Cancelling previous debounce, scheduling new one...");
      clearTimeout(debounceTimeoutRef.current);
    } else {
      console.log("Scheduling debounced IDL refresh (500ms delay)...");
    }
    
    // Set debouncing state
    setIsDebouncing(true);
    
    // Set new timeout (500ms debounce)
    debounceTimeoutRef.current = setTimeout(() => {
      console.log("Debounced IDL refresh triggered - fetching new IDL");
      setIsDebouncing(false);
      fetchIdl();
    }, 500);
  };

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    url: "ws://localhost:3000",
    onMessage: (message) => {
      if (message === "IDL_UPDATED") {
        console.log("Received IDL_UPDATED message from server");
        debouncedRefresh();
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

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    idl,
    error,
    isLoading: loading,
    fetchIdl,
    setIdl,
    isWebSocketConnected: isConnected,
    isDebouncing,
  };
};

export default UseIdl;
