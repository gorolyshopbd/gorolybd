'use client';

import { useState, useCallback } from 'react';

export function useRealtime(channelName, eventHandlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  
  const publish = useCallback(async (event, payload) => {
    // Realtime disabled after Postgres migration
  }, []);

  return { isConnected, publish };
}

export function useRealtimeDashboard() {
  return useRealtime('dashboard', {});
}

export function useRealtimeOrder(orderId, handlers) {
  return useRealtime(`orders:${orderId}`, handlers);
}

export function useRealtimeProduct(productId, handlers) {
  return useRealtime(`products:${productId}`, handlers);
}

export function useRealtimeChat(sessionId, handlers) {
  return useRealtime(`chat:${sessionId}`, handlers);
}
