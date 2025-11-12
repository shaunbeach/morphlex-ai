import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConnectionStatus, JsonRpcRequest, JsonRpcResponse } from 'types';

interface McpHook {
  connectionStatus: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (method: string, params?: any) => Promise<any>;
  lastMessage: any;
}

const WS_URL = 'ws://localhost:3030';

export function useMcp(): McpHook {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected' as ConnectionStatus);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef(1);
  const pendingRequestsRef = useRef<Map<number, { resolve: (value: any) => void; reject: (reason?: any) => void }>>(
    new Map()
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('Connecting' as ConnectionStatus);

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected' as ConnectionStatus);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle JSON-RPC responses
          if (message.id !== undefined) {
            const pending = pendingRequestsRef.current.get(message.id);
            if (pending) {
              if (message.error) {
                pending.reject(new Error(message.error.message));
              } else {
                pending.resolve(message.result);
              }
              pendingRequestsRef.current.delete(message.id);
            }
          }

          // Handle notifications
          if (message.method) {
            setLastMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error' as ConnectionStatus);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('Disconnected' as ConnectionStatus);
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('Error' as ConnectionStatus);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('Disconnected' as ConnectionStatus);
  }, []);

  const sendMessage = useCallback((method: string, params?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const id = requestIdRef.current++;
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      pendingRequestsRef.current.set(id, { resolve, reject });

      wsRef.current.send(JSON.stringify(request));

      // Timeout after 30 seconds
      setTimeout(() => {
        const pending = pendingRequestsRef.current.get(id);
        if (pending) {
          pending.reject(new Error('Request timeout'));
          pendingRequestsRef.current.delete(id);
        }
      }, 30000);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    lastMessage,
  };
}
