import { useEffect, useRef, useState } from 'react';
import { sb, hasSupabase } from '../lib/supabase';

export interface LiveEvent {
  id: number;
  ts: number;
  kind: string;
  chat_id?: number | null;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'offline';

export function useLiveFeed(limit = 30) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>(
    hasSupabase ? 'connecting' : 'offline',
  );
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!hasSupabase || !sb) {
      setStatus('offline');
      return;
    }

    const channel = sb
      .channel('itsuki:live-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'web_live_feed' },
        (payload) => {
          if (!mounted.current) return;
          const ev = payload.new as LiveEvent;
          setEvents((prev) => [ev, ...prev].slice(0, limit));
        },
      )
      .subscribe((st) => {
        if (!mounted.current) return;
        if (st === 'SUBSCRIBED') setStatus('connected');
        else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') setStatus('disconnected');
        else if (st === 'CLOSED') setStatus('disconnected');
      });

    return () => {
      mounted.current = false;
      sb.removeChannel(channel);
    };
  }, [limit]);

  return { events, status };
}
