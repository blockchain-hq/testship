import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketProps {
  url: string;
  enabled?: boolean;
  onMessage?: (message: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  url,
  enabled = true,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  }, [onMessage, onOpen, onClose, onError]);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setReconnectAttempts(0);
        onOpenRef.current?.();
      };

      ws.onmessage = (event) => {
        onMessageRef.current?.(event.data);
      };

      ws.onclose = () => {
        setIsConnected(false);
        onCloseRef.current?.();

        setReconnectAttempts((prev) => {
          if (prev < maxReconnectAttempts) {
            console.log(
              `Attempting to reconnect... (${prev + 1}/${maxReconnectAttempts})`
            );
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay);
            return prev + 1;
          } else {
            console.log("Max reconnection attempts reached");
            return prev;
          }
        });
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        onErrorRef.current?.(error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [url]);

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect]);

  return {
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
  };
};
