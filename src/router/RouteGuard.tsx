import { useEffect, useState, type ReactNode } from 'react';
import type { ParsedUrl } from '../lib/urlParser';
import { sb, hasSupabase, type VerifyResponse } from '../lib/supabase';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Fake404 } from '../components/Fake404';

const SESSION_KEY = 'itsuki.session';

export interface RouteGuardProps {
  url: ParsedUrl;
  children: ReactNode;
}

export function RouteGuard({ url, children }: RouteGuardProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'denied' | 'need_login'>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');

    (async () => {
      // 1. Sin Supabase → dev, permitir
      if (!hasSupabase || !sb) {
        console.warn('[RouteGuard] Supabase no configurado, modo dev');
        if (!cancelled) setState('ok');
        return;
      }

      // 2. ¿Session previa?
      const existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) {
        const { data } = await sb.rpc('web_validate_session', {
          p_session: existing,
        }) as { data: { ok: boolean } | null };
        if (data?.ok) {
          if (!cancelled) setState('ok');
          return;
        }
        sessionStorage.removeItem(SESSION_KEY);
      }

      // 3. Sin token URL → redirigir a login
      if (!url.token) {
        if (!cancelled) setState('need_login');
        return;
      }

      // 4. Canjear token
      const pageName = url.namePage ?? url.gamePage ?? 'home';
      const { data, error } = await sb.rpc('web_verify_token', {
        p_token:        url.token,
        p_hexa:         url.accessLevel,
        p_chat_id:      url.chatId,
        p_name_page:    pageName,
        p_telegram:     url.telegramId,
        p_ip:           null,
        p_user_agent:   navigator.userAgent.slice(0, 200),
        p_session_ttl:  900,
      }) as { data: VerifyResponse | null; error: unknown };

      if (error || !data?.ok) {
        console.warn('[RouteGuard] verify fail', error ?? data);
        if (!cancelled) setState('denied');
        return;
      }

      sessionStorage.setItem(SESSION_KEY, data.session_token!);
      if (!cancelled) setState('ok');
    })();

    return () => { cancelled = true; };
  }, [url]);

  if (state === 'loading')     return <LoadingSkeleton />;
  if (state === 'denied')      return <Fake404 />;
  if (state === 'need_login') {
    // Redirigir a /login (replace para no dejar historial)
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return <LoadingSkeleton />;
  }
  return <>{children}</>;
}
