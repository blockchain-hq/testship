/* eslint-disable react-refresh/only-export-components */
import type { Idl } from "@coral-xyz/anchor";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

type IDLContextType = {
  idl: Idl | null;
  error: string | null;
  isLoading: boolean;
  fetchIdl: () => void;
  setIdl: (idl: Idl) => void;
};

const IDLContext = createContext<IDLContextType | null>(null);

export const IDLProvider = ({ children }: { children: React.ReactNode }) => {
  const [idl, setIdl] = useState<Idl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchIdl();
    }, 500);
  };

  useWebSocket({
    url: "ws://localhost:3000",
    onMessage: (message) => {
      if (message === "IDL_UPDATED") {
        console.log("IDL updated, refreshing...");
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

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <IDLContext.Provider
      value={{
        idl,
        error,
        isLoading: loading,
        fetchIdl,
        setIdl
      }}
    >
      {children}
    </IDLContext.Provider>
  );
};

export const useIDL = () => {
  const context = useContext(IDLContext);
  if (!context) {
    throw new Error("useIDL must be used within an IDLProvider");
  }
  return context;
};
