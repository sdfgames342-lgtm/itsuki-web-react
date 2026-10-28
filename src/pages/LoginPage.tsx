import { useState } from 'react';
import { sb, hasSupabase } from '../lib/supabase';
import { accessLevelToAP } from '../lib/apHex';
import { extraDigit } from '../lib/extraDigit';

const SESSION_KEY = 'itsuki.session';

export function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const uid = Number(userId.trim());
    if (!Number.isInteger(uid) || uid <= 0) {
      setError('User ID inválido');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!hasSupabase || !sb) {
      setError('Backend no configurado');
      return;
    }

    setLoading(true);
    try {
      const { data, error: rpcErr } = await sb.rpc('web_login', {
        p_user_id:     uid,
        p_password:    password,
        p_ip:          null,
        p_user_agent:  navigator.userAgent.slice(0, 200),
        p_session_ttl: 900,
      });

      if (rpcErr) throw new Error(rpcErr.message);
      if (!data?.ok) {
        const msgs: Record<string, string> = {
          no_credentials: 'No hay credenciales para ese user_id',
          bad_password:   'Contraseña incorrecta',
        };
        throw new Error(msgs[data?.reason] ?? data?.reason ?? 'Error desconocido');
      }

      sessionStorage.setItem(SESSION_KEY, data.session_token);

      // Redirect a la URL "clean" del panel
      const hexa = accessLevelToAP(9000);
      const extra = extraDigit(uid);
      location.href = `/${hexa}/ctrl/${extra}/home/${uid}`;
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h1 style={styles.title}>🔐 Iniciar sesión</h1>
        <p style={styles.subtitle}>
          Si es tu primera vez, usá <code>/dar_admin</code> con el owner.
        </p>

        <label style={styles.label}>
          User ID de Telegram
          <input
            type="text"
            inputMode="numeric"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={8}
            required
            style={styles.input}
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>

        <p style={styles.footer}>
          <a href="/" style={styles.link}>← Volver al inicio</a>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    fontFamily: '"JetBrains Mono", monospace',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,183,197,0.3)',
    borderRadius: '10px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    color: '#FFB7C5',
    fontSize: '1.6rem',
    margin: 0,
  },
  subtitle: {
    color: 'rgba(255,183,197,0.6)',
    fontSize: '0.85rem',
    margin: 0,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'rgba(255,183,197,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    background: '#0a0809',
    border: '1px solid rgba(255,183,197,0.3)',
    borderRadius: '6px',
    padding: '0.7rem',
    color: '#f0e6e9',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.95rem',
  },
  button: {
    background: '#FFB7C5',
    color: '#2e1a1f',
    border: 'none',
    borderRadius: '6px',
    padding: '0.85rem',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#ef4444',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    margin: 0,
  },
  link: {
    color: 'rgba(255,183,197,0.7)',
    textDecoration: 'none',
    fontSize: '0.8rem',
  },
};
