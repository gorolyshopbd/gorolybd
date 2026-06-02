'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@insforge/sdk';

let sharedClient = null;
let sharedListeners = 0;

function getClient() {
  if (!sharedClient) {
    sharedClient = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    });
  }
  return sharedClient;
}

export function useRealtime(channelName, eventHandlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef(eventHandlers);
  const channelRef = useRef(null);

  useEffect(() => {
    handlersRef.current = eventHandlers;
  });

  useEffect(() => {
    const client = getClient();
    let mounted = true;

    sharedListeners++;

    const init = async () => {
      try {
        if (!client.realtime.isConnected) {
          await client.realtime.connect();
        }
        if (!mounted) return;
        setIsConnected(client.realtime.isConnected);

        if (channelName) {
          const res = await client.realtime.subscribe(channelName);
          if (res && res.ok) {
            channelRef.current = channelName;
          }
        }
      } catch (error) {
        if (mounted) setIsConnected(false);
        console.warn('Realtime connection unavailable:', error?.message || error);
      }
    };

    init();

    const onConnect = () => { if (mounted) setIsConnected(true); };
    const onDisconnect = () => { if (mounted) setIsConnected(false); };

    client.realtime.on('connect', onConnect);
    client.realtime.on('disconnect', onDisconnect);

    return () => {
      mounted = false;
      sharedListeners--;
      client.realtime.off('connect', onConnect);
      client.realtime.off('disconnect', onDisconnect);

      if (channelRef.current) {
        try {
          client.realtime.unsubscribe(channelRef.current);
        } catch (error) {
          console.warn('Realtime unsubscribe skipped:', error?.message || error);
        }
      }
      if (sharedListeners <= 0 && sharedClient) {
        try {
          client.realtime.disconnect();
        } catch (error) {
          console.warn('Realtime disconnect skipped:', error?.message || error);
        }
        sharedClient = null;
      }
    };
  }, [channelName]);

  useEffect(() => {
    const client = getClient();
    const handlers = handlersRef.current;
    const entries = Object.entries(handlers);

    entries.forEach(([event, handler]) => {
      client.realtime.on(event, handler);
    });

    return () => {
      entries.forEach(([event, handler]) => {
        client.realtime.off(event, handler);
      });
    };
  }, [eventHandlers]);

  const publish = useCallback(async (event, payload) => {
    if (!channelName) return;
    const client = getClient();
    try {
      await client.realtime.publish(channelName, event, payload);
    } catch (error) {
      console.warn('Realtime publish unavailable:', error?.message || error);
    }
  }, [channelName]);

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
