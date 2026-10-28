import { useEffect, useState } from 'react';
import { sb, hasSupabase } from '../../lib/supabase';

const SESSION_KEY = 'itsuki.session';

interface AdminRow {
  user_id: number;
  role?: string;
  added_at?: number | string;
}

interface XpRow {
  user_id: number;
  xp: number;
  streak_days: number;
}

export function MembersTab({ chatId }: { chatId: number }) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [xp, setXp] = useState<XpRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    if (!hasSupabase || !sb) {
      setLoading(false);
      return;
    }
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) {
      setErr('sin sesión');
      setLoading(false);
      return;
    }
    try {
      const [a, x] = await Promise.all([
        sb.rpc('web_list_group_admins', { p_session: token, p_chat_id: chatId }),
        sb.rpc('web_get_xp_weekly',     { p_session: token, p_chat_id: chatId, p_limit: 10 }),
      ]);
      const aData = a.data as { ok: boolean; admins?: AdminRow[]; reason?: string } | null;
      const xData = x.data as { ok: boolean; rows?: XpRow[]; reason?: string } | null;
      if (!aData?.ok) setErr(aData?.reason ?? 'error admins');
      else setAdmins(aData.admins ?? []);
      if (xData?.ok) setXp(xData.rows ?? []);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [chatId]);

  const remove = async (uid: number) => {
    if (!sb) return;
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) return;
    if (!confirm(`Quitar admin a ${uid}?`)) return;
    const { data } = await sb.rpc('web_remove_group_admin', {
      p_session: token, p_chat_id: chatId, p_target: uid,
    });
    const d = data as { ok: boolean } | null;
    if (d?.ok) await load();
  };

  if (loading) return <p style={styles.muted}>Cargando…</p>;

  return (
    <>
      <h2 style={styles.h2}>👥 Miembros</h2>
      {err && <p style={styles.err}>{err}</p>}

      <section style={styles.section}>
        <h3 style={styles.h3}>Admins ({admins.length})</h3>
        {admins.length === 0
          ? <p style={styles.muted}>Sin admins registrados.</p>
          : (
            <ul style={styles.list}>
              {admins.map((a) => (
                <li key={a.user_id} style={styles.item}>
                  <code style={styles.code}>{a.user_id}</code>
                  <span style={styles.muted}>{a.role ?? 'admin'}</span>
                  <button style={styles.btnDanger} onClick={() => remove(a.user_id)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
      </section>

      <section style={styles.section}>
        <h3 style={styles.h3}>🏆 Top XP</h3>
        {xp.length === 0
          ? <p style={styles.muted}>Sin datos todavía.</p>
          : (
            <ul style={styles.list}>
              {xp.map((r, i) => (
                <li key={r.user_id} style={styles.item}>
                  <span style={styles.rank}>{i + 1}</span>
                  <code style={styles.code}>{r.user_id}</code>
                  <span style={styles.muted}>{r.xp} XP · 🔥{r.streak_days}</span>
                </li>
              ))}
            </ul>
          )}
      </section>

      <button style={styles.btn} onClick={() => void load()}>Recargar</button>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h2: { fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: '#FFB7C5', fontSize: '1.4rem', margin: '0 0 1rem' },
  h3: { color: '#FFB7C5', fontSize: '1rem', margin: '1.5rem 0 0.6rem' },
  section: { marginBottom: '1rem' },
  muted: { color: 'rgba(255,183,197,0.6)', fontSize: '0.85rem' },
  err: { color: '#ef4444', fontSize: '0.85rem' },
  list: { listStyle: 'none', padding: 0, margin: 0, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,183,197,0.15)', borderRadius: 8, overflow: 'hidden' },
  item: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,183,197,0.08)', fontSize: '0.85rem' },
  code: { color: '#f0e6e9', background: 'rgba(255,183,197,0.08)', padding: '0.1rem 0.4rem', borderRadius: 4 },
  rank: { color: '#FFB7C5', fontWeight: 700, minWidth: 20 },
  btn: { background: 'transparent', color: '#FFB7C5', border: '1px solid rgba(255,183,197,0.4)', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', marginTop: '1rem' },
  btnDanger: { marginLeft: 'auto', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', padding: '0.25rem 0.6rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem' },
};
