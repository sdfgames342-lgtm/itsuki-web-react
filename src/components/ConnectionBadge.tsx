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
