import { useLiveFeed } from '../hooks/useLiveFeed';

const KIND_LABEL: Record<string, string> = {
  daily:             '💧 Daily',
  payment:           '💳 Pago',
  onboarding_bonus:  '🎁 Bono',
  game_win:          '🏆 Victoria',
  broadcast_sent:    '📣 Broadcast',
  sala_create:       '⚔️ Sala creada',
  sala_close:        '⚔️ Sala cerrada',
  genkey:            '🔑 Key',
  redeem:            '🎟️ Redeem',
  channel_set:       '📡 Canal',
  admin_login:       '🔐 Admin login',
};

const STATUS_DOT: Record<string, string> = {
  connecting:    '#eab308',
  connected:     '#22c55e',
  disconnected:  '#ef4444',
  offline:       '#6b7280',
};

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor(Date.now() / 1000 - ts));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function LiveFeed() {
  const { events, status } = useLiveFeed(30);

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>📡 En vivo</h2>
        <span style={styles.statusBadge}>
          <span style={{ ...styles.dot, background: STATUS_DOT[status] }} />
          {status}
        </span>
      </div>

      {events.length === 0 ? (
        <p style={styles.muted}>Esperando eventos…</p>
      ) : (
        <ul style={styles.list}>
          {events.map((e) => (
            <li key={e.id} style={styles.item}>
              <span style={styles.itemKind}>
                {KIND_LABEL[e.kind] ?? `• ${e.kind}`}
              </span>
              <span style={styles.itemTime}>{timeAgo(e.ts)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    color: '#FFB7C5',
    fontSize: '1.1rem',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.7rem',
    color: 'rgba(255,183,197,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,183,197,0.15)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid rgba(255,183,197,0.08)',
    fontSize: '0.85rem',
  },
  itemKind: {
    color: '#f0e6e9',
  },
  itemTime: {
    color: 'rgba(255,183,197,0.5)',
    fontSize: '0.75rem',
  },
  muted: {
    color: 'rgba(255,183,197,0.6)',
    fontSize: '0.85rem',
  },
};
