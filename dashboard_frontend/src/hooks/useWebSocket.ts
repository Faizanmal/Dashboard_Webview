'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboardApi';
import { useAuthStore } from '@/stores/authStore';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useDashboardWebSocket(dashboardId: number | string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !dashboardId) return;

    try {
      const ws = dashboardApi.createDashboardWebSocket(dashboardId);

      ws.onopen = () => {
        console.log('Dashboard WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Dashboard WebSocket disconnected');
        setIsConnected(false);
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [dashboardId, isAuthenticated]);

  const subscribeToMetrics = useCallback((metrics: string[]) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe_metrics',
          metrics,
        })
      );
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    subscribeToMetrics,
    sendMessage,
  };
}

export function useMetricsWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const ws = dashboardApi.createMetricsWebSocket();

      ws.onopen = () => {
        console.log('Metrics WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'metric_update') {
            setMetrics((prev) => ({
              ...prev,
              [data.metric_name]: {
                value: data.value,
                timestamp: data.timestamp,
              },
            }));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Metrics WebSocket disconnected');
        setIsConnected(false);
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [isAuthenticated]);

  const requestMetrics = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'request_metrics',
        })
      );
    }
  }, []);

  return {
    isConnected,
    metrics,
    requestMetrics,
  };
}
