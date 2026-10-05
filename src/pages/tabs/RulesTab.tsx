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
