#!/usr/bin/env bash
set -euo pipefail
cd ~/itsuki-web-react
export PYTHONIOENCODING=utf-8
TS="$(date +%Y%m%d_%H%M%S)"; BK=".bak_${TS}"; mkdir -p "$BK"
backup() { [ -f "$1" ] && cp "$1" "$BK/$(echo "$1" | tr '/' '__')" && echo "  · backup $1"; return 0; }
echo "▶ repo=$PWD backups=$BK"

mkdir -p src/pages/tabs

echo; echo "══ 1. useReconnect.ts ══"
backup src/hooks/useReconnect.ts
cat > src/hooks/useReconnect.ts <<'TS'
import { useEffect, useRef, useState } from 'react';

/**
 * Reintenta una función de setup con backoff exponencial.
 * `setup` debe devolver un cleanup.
 * Devuelve `attempt` (0 = OK) y `delayMs` (próximo intento).
 */
export function useReconnect(
  setup: () => (() => void) | void,
  opts: { baseMs?: number; maxMs?: number } = {},
) {
  const baseMs = opts.baseMs ?? 1000;
  const maxMs  = opts.maxMs  ?? 30000;
  const [attempt, setAttempt] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  useEffect(() => {
    const cleanup = setup();
    cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [attempt]);

  const triggerRetry = () => {
    if (!aliveRef.current) return;
    const delay = Math.min(maxMs, baseMs * 2 ** attempt);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (aliveRef.current) setAttempt((a) => a + 1);
    }, delay);
  };

  const reset = () => setAttempt(0);

  return { attempt, triggerRetry, reset };
}
TS
echo "  ✓ useReconnect.ts"

echo; echo "══ 2. ConnectionBadge.tsx ══"
backup src/components/ConnectionBadge.tsx
cat > src/components/ConnectionBadge.tsx <<'TSX'
import type { ConnectionStatus } from '../hooks/useLiveFeed';

const LABEL: Record<ConnectionStatus | 'reconnecting', string> = {
  connecting:     'conectando',
  connected:      'en vivo',
  disconnected:   'desconectado',
  offline:        'offline',
  reconnecting:   'reconectando',
};

const COLOR: Record<ConnectionStatus | 'reconnecting', string> = {
  connecting:     '#eab308',
  connected:      '#22c55e',
  disconnected:   '#ef4444',
  offline:        '#6b7280',
  reconnecting:   '#f97316',
};

export function ConnectionBadge({
  status,
  attempt = 0,
}: {
  status: ConnectionStatus | 'reconnecting';
  attempt?: number;
}) {
  return (
    <span style={styles.badge}>
      <span style={{ ...styles.dot, background: COLOR[status] }} />
      {LABEL[status]}
      {attempt > 0 && <span style={styles.retry}>·{attempt}</span>}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.7rem',
    color: 'rgba(255,183,197,0.75)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  retry: {
    color: 'rgba(255,183,197,0.5)',
    marginLeft: 2,
  },
};
TSX
echo "  ✓ ConnectionBadge.tsx"

echo; echo "══ 3. MembersTab.tsx ══"
backup src/pages/tabs/MembersTab.tsx
cat > src/pages/tabs/MembersTab.tsx <<'TSX'
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
TSX
echo "  ✓ MembersTab.tsx"

echo; echo "══ 4. RulesTab.tsx ══"
backup src/pages/tabs/RulesTab.tsx
cat > src/pages/tabs/RulesTab.tsx <<'TSX'
import { useEffect, useState } from 'react';
import { sb, hasSupabase } from '../../lib/supabase';

const SESSION_KEY = 'itsuki.session';
const MAX_LEN = 4000;

export function RulesTab({ chatId }: { chatId: number }) {
  const [text, setText] = useState('');
  const [initial, setInitial] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'ok' | 'err'>('loading');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabase || !sb) { setStatus('idle'); return; }
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) { setErr('sin sesión'); setStatus('err'); return; }
    (async () => {
      const { data } = await sb.rpc('web_get_group_rules', {
        p_session: token, p_chat_id: chatId,
      });
      const d = data as { ok: boolean; rules?: { text?: string } } | null;
      if (d?.ok) {
        const t = d.rules?.text ?? '';
        setText(t); setInitial(t); setStatus('idle');
      } else {
        setErr('no se pudo cargar'); setStatus('err');
      }
    })();
  }, [chatId]);

  const save = async () => {
    if (!sb) return;
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) return;
    if (text.length > MAX_LEN) { setErr('máx ' + MAX_LEN + ' caracteres'); setStatus('err'); return; }
    setStatus('saving');
    const { data } = await sb.rpc('web_set_group_rules', {
      p_session: token, p_chat_id: chatId, p_text: text,
    });
    const d = data as { ok: boolean; reason?: string } | null;
    if (d?.ok) { setInitial(text); setStatus('ok'); setTimeout(() => setStatus('idle'), 1500); }
    else { setErr(d?.reason ?? 'error'); setStatus('err'); }
  };

  const dirty = text !== initial;

  return (
    <>
      <h2 style={styles.h2}>📜 Reglas</h2>
      <p style={styles.muted}>
        Markdown simple. Los cambios se guardan en la base y se muestran con /rules en el grupo.
      </p>
      <textarea
        style={styles.textarea}
        value={text}
        onChange={(e) => { setText(e.target.value); if (status !== 'idle') setStatus('idle'); }}
        rows={14}
        maxLength={MAX_LEN}
        placeholder="1. Respetá a los demás.&#10;2. No spam.&#10;..."
      />
      <div style={styles.row}>
        <span style={styles.muted}>{text.length}/{MAX_LEN}</span>
        {status === 'ok'    && <span style={styles.ok}>✓ guardado</span>}
        {status === 'err'   && <span style={styles.err}>{err}</span>}
        {status === 'saving' && <span style={styles.muted}>guardando…</span>}
        <button
          style={{ ...styles.btn, opacity: dirty && status !== 'saving' ? 1 : 0.5 }}
          disabled={!dirty || status === 'saving'}
          onClick={() => void save()}
        >
          Guardar
        </button>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h2: { fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: '#FFB7C5', fontSize: '1.4rem', margin: '0 0 0.5rem' },
  muted: { color: 'rgba(255,183,197,0.6)', fontSize: '0.85rem' },
  ok: { color: '#22c55e', fontSize: '0.85rem' },
  err: { color: '#ef4444', fontSize: '0.85rem' },
  textarea: {
    width: '100%', minHeight: 260, marginTop: '1rem',
    background: 'rgba(0,0,0,0.4)', color: '#f0e6e9',
    border: '1px solid rgba(255,183,197,0.2)', borderRadius: 8,
    padding: '0.9rem 1rem', fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.85rem', lineHeight: 1.5, resize: 'vertical',
  },
  row: { display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem' },
  btn: {
    marginLeft: 'auto', background: 'transparent', color: '#FFB7C5',
    border: '1px solid rgba(255,183,197,0.4)', padding: '0.5rem 1.2rem',
    borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
  },
};
TSX
echo "  ✓ RulesTab.tsx"

echo; echo "══ 5. SettingsTab.tsx ══"
backup src/pages/tabs/SettingsTab.tsx
cat > src/pages/tabs/SettingsTab.tsx <<'TSX'
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
TSX
echo "  ✓ SettingsTab.tsx"

echo; echo "══ 6. AdminPage.tsx: usar tabs nuevas + badge ══"
backup src/pages/AdminPage.tsx
python3 - <<'PYEOF'
import re
from pathlib import Path
p = Path("src/pages/AdminPage.tsx")
src = p.read_text(encoding="utf-8")

# 1. imports
if "from './tabs/MembersTab'" not in src:
    src = src.replace(
        "import { sb } from '../lib/supabase';",
        "import { sb } from '../lib/supabase';\n"
        "import { MembersTab } from './tabs/MembersTab';\n"
        "import { RulesTab }   from './tabs/RulesTab';\n"
        "import { SettingsTab } from './tabs/SettingsTab';"
    )

# 2. quitar definiciones locales de MembersTab/RulesTab/SettingsTab
for fn in ("MembersTab", "RulesTab", "SettingsTab"):
    src = re.sub(
        rf"\nfunction {fn}\(\) \{{[^}}]*\}}\n",
        "\n", src, flags=re.DOTALL)

# 3. pasar chatId a los tabs
src = src.replace("{tab === 'members'  && <MembersTab />}",  "{tab === 'members'  && <MembersTab  chatId={chatId} />}")
src = src.replace("{tab === 'rules'    && <RulesTab />}",    "{tab === 'rules'    && <RulesTab    chatId={chatId} />}")
src = src.replace("{tab === 'settings' && <SettingsTab />}", "{tab === 'settings' && <SettingsTab chatId={chatId} />}")

p.write_text(src, encoding="utf-8")
print("  ✓ AdminPage.tsx parcheado")
PYEOF

echo; echo "══ 7. Build ══"
if command -v npm >/dev/null 2>&1; then
  npm run build 2>&1 | tail -6 || echo "  ⚠️  build con errores, revisar"
else
  echo "  ⚠️  npm no encontrado, saltando build"
fi

echo; echo "════ SCAFFOLD B LISTO · backups=$BK ════"
echo "Commit sugerido:"
echo "  cd ~/itsuki-web-react && git add -A && git commit -m 'feat(admin): tabs reales + useReconnect + badge'"
