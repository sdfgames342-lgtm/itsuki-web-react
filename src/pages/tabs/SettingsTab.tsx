import { useEffect, useState } from 'react';
import { sb, hasSupabase } from '../../lib/supabase';

const SESSION_KEY = 'itsuki.session';
const LANGS = ['es', 'en', 'pt'];

export function SettingsTab({ chatId }: { chatId: number }) {
  const [lang, setLang] = useState('es');
  const [notifStreak, setNotifStreak] = useState(false);
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'ok' | 'err'>('loading');

  useEffect(() => {
    if (!hasSupabase || !sb) { setStatus('idle'); return; }
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) { setStatus('idle'); return; }
    (async () => {
      const { data } = await sb.rpc('web_get_group_style', {
        p_session: token, p_chat_id: chatId,
      });
      const d = data as { ok: boolean; style?: Record<string, unknown> } | null;
      if (d?.ok && d.style) {
        const s = d.style as { lang?: string; notif_streak?: boolean };
        if (s.lang) setLang(s.lang);
        if (typeof s.notif_streak === 'boolean') setNotifStreak(s.notif_streak);
      }
      setStatus('idle');
    })();
  }, [chatId]);

  const save = async () => {
    if (!sb) return;
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) return;
    setStatus('saving');
    const { data } = await sb.rpc('web_set_group_style', {
      p_session: token,
      p_chat_id: chatId,
      p_patch: { lang, notif_streak: notifStreak },
    });
    const d = data as { ok: boolean; reason?: string } | null;
    setStatus(d?.ok ? 'ok' : 'err');
    setTimeout(() => setStatus('idle'), 1200);
  };

  if (status === 'loading') return <p style={styles.muted}>Cargando…</p>;

  return (
    <>
      <h2 style={styles.h2}>⚙️ Ajustes</h2>

      <section style={styles.section}>
        <h3 style={styles.h3}>Idioma del grupo</h3>
        <div style={styles.row}>
          {LANGS.map((l) => (
            <button
              key={l}
              style={{ ...styles.pill, ...(lang === l ? styles.pillActive : {}) }}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.h3}>Notificaciones de racha</h3>
        <label style={styles.toggle}>
          <input
            type="checkbox"
            checked={notifStreak}
            onChange={(e) => setNotifStreak(e.target.checked)}
          />
          <span>
            Avisar por DM si la racha está en riesgo (19–21 h).
            Los usuarios deben activarlo con /streak_notif on.
          </span>
        </label>
      </section>

      <div style={styles.row}>
        {status === 'ok'  && <span style={styles.ok}>✓ guardado</span>}
        {status === 'err' && <span style={styles.err}>error</span>}
        <button style={styles.btn} onClick={() => void save()} disabled={status === 'saving'}>
          Guardar
        </button>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h2: { fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: '#FFB7C5', fontSize: '1.4rem', margin: '0 0 1rem' },
  h3: { color: '#FFB7C5', fontSize: '1rem', margin: '1.2rem 0 0.6rem' },
  section: { marginBottom: '0.5rem' },
  row: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.8rem' },
  pill: {
    background: 'transparent', color: 'rgba(240,230,233,0.7)',
    border: '1px solid rgba(255,183,197,0.25)', padding: '0.4rem 0.9rem',
    borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
  },
  pillActive: { background: 'rgba(255,183,197,0.15)', color: '#FFB7C5' },
  toggle: { display: 'flex', gap: '0.7rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'rgba(240,230,233,0.8)' },
  btn: { marginLeft: 'auto', background: 'transparent', color: '#FFB7C5', border: '1px solid rgba(255,183,197,0.4)', padding: '0.5rem 1.2rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' },
  muted: { color: 'rgba(255,183,197,0.6)', fontSize: '0.85rem' },
  ok: { color: '#22c55e', fontSize: '0.85rem' },
  err: { color: '#ef4444', fontSize: '0.85rem' },
};
