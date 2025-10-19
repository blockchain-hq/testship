import type { Idl } from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";

export type AppMode =
  | "local-server" // running with local server
  | "remote-to-local" // remote ui + local server
  | "standalone" // remote ui only, manual idl load
  | "shared-session"; // shared url with session

export interface AppContextState {
  mode: AppMode;
  idl: Idl | null;
  isLoading: boolean;
  error: string | null;
  rpcEndpoint: string;
  localPort: number;
}

export const useAppContext = () => {
  const [state, setState] = useState<AppContextState>({
    mode: "standalone",
    idl: null,
    isLoading: true,
    error: null,
    rpcEndpoint: "http://127.0.0.1:8899",
    localPort: 3000,
  });

  const detectMode = useCallback(async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const isLocalhost = window.location.hostname === "localhost";
    const hasLocalMode = searchParams.get("mode") === "local";
    const hasSession = window.location.pathname.startsWith("/s/");
    const port = parseInt(searchParams.get("port") || "3000");

    try {
      if (isLocalhost) {
        setState((prev) => ({
          ...prev,
          mode: "local-server",
          localPort: port,
        }));
        // get idl from local express server
        await loadIdlFromLocalServer(port);
      } else if (hasLocalMode) {
        setState((prev) => ({
          ...prev,
          mode: "remote-to-local",
          localPort: port,
        }));
        // remote ui connecting to local server
        await loadIdlFromLocalServer(port);
      } else if (hasSession) {
        setState((prev) => ({ ...prev, mode: "shared-session" }));
        // load session
        await loadFromSession();
      } else {
        // need manual load
        setState((prev) => ({ ...prev, mode: "standalone", isLoading: false }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load",
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    const initDetectMode = async () => {
      await detectMode();
    };
    initDetectMode();
  }, [detectMode]);

  useEffect(() => {
    console.log(state, "app state");
  }, [state]);

  const loadIdlFromLocalServer = async (port: number) => {
    try {
      const response = await fetch(`http://localhost:${port}/api/idl`);
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        idl: data,
        isLoading: false,
        error: null,
      }));
    } catch {
      throw new Error(
        `Cannot connect to local server on port ${port}. ` +
          `Make sure 'testship start' is running.`
      );
    }
  };

  const loadFromSession = async () => {
    // TODO: implement

    setState((prev) => ({
      ...prev,
      error: "Loading from Session is not supported yet",
      isLoading: false,
    }));
  };

  const loadIDLManually = (idl: Idl) => {
    setState((prev) => ({ ...prev, idl, isLoading: false, error: null }));
  };

  const setRpcEndpoint = (endpoint: string) => {
    setState((prev) => ({ ...prev, rpcEndpoint: endpoint }));
  };

  return {
    ...state,
    loadIDLManually,
    setRpcEndpoint,
    retry: () => {
      detectMode();
    },
  };
};
