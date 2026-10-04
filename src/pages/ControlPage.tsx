import { useEffect, useState } from 'react';
import type { ParsedUrl } from '../lib/urlParser';
import { sb, hasSupabase } from '../lib/supabase';
import { LiveFeed } from '../components/LiveFeed';

const SESSION_KEY = 'itsuki.session';

interface SessionInfo {
  user_id: number;
  kind: string;
  name_page: string;
  expires_at: number;
}

export function ControlPage({ url }: { url: ParsedUrl }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Sin Supabase → dev
      if (!hasSupabase || !sb) {
        setSession({ user_id: url.telegramId, kind: url.kind, name_page: url.namePage ?? '', expires_at: 0 });
        setLoading(false);
        return;
      }

      // 2. Leer session de sessionStorage
      const token = sessionStorage.getItem(SESSION_KEY);
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      // 3. Validar contra backend
      const { data } = await sb.rpc('web_validate_session', { p_session: token });
      if (cancelled) return;

      if (data?.ok) {
        setSession({
          user_id: data.user_id,
          kind: data.kind,
          name_page: data.name_page,
          expires_at: data.expires_at,
        });
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [url]);

  const handleLogout = async () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token && sb) {
      try { await sb.rpc('web_logout', { p_session: token }); } catch { /* noop */ }
    }
    sessionStorage.clear();
    location.href = '/';
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Cargando…
      </div>
    );
  }

  if (!session) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>🔐 Panel Itsuki</h1>
        <p style={styles.muted}>
          No hay sesión activa. Pedí un link nuevo con <code>/admin</code> en el bot.
        </p>
      </div>
    );
  }

  const remaining = session.expires_at > 0
    ? Math.max(0, Math.floor((session.expires_at * 1000 - Date.now()) / 60000))
    : null;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🔐 Panel Itsuki</h1>
        <button onClick={handleLogout} style={styles.logout}>
          Cerrar sesión
        </button>
      </header>

      <div style={styles.card}>
        <p style={styles.info}>
          <b>User ID:</b> <code>{session.user_id}</code>
        </p>
        <p style={styles.info}>
          <b>Kind:</b> <code>{session.kind}</code> · <b>Page:</b> <code>{session.name_page}</code>
        </p>
        {remaining !== null && (
          <p style={styles.muted}>
            ⏱ Sesión activa ~{remaining} min
          </p>
        )}
      </div>

      <div style={styles.placeholder}>
        <p style={styles.muted}>
          Dashboard en construcción. Próximo: KPIs, usuarios, grupos, keys.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    padding: '2rem',
    maxWidth: 900,
    margin: '0 auto',
    fontFamily: '"JetBrains Mono", monospace',
    color: '#f0e6e9',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    color: '#FFB7C5',
    fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    margin: 0,
  },
  logout: {
    background: 'transparent',
    color: '#FFB7C5',
    border: '1px solid rgba(255,183,197,0.4)',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  card: {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,183,197,0.3)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  info: {
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  muted: {
    color: 'rgba(255,183,197,0.6)',
    fontSize: '0.85rem',
  },
  placeholder: {
    border: '1px dashed rgba(255,183,197,0.3)',
    borderRadius: '8px',
    padding: '3rem 1.5rem',
    textAlign: 'center',
  },
  loading: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,183,197,0.6)',
    fontFamily: '"JetBrains Mono", monospace',
  },
};
{/* ─── Live feed ─────────────────────────────── */}
<section style={styles.section}>
<LiveFeed />
</section>

