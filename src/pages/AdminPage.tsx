import type { ParsedUrl } from '../lib/urlParser';

export function AdminPage({ url }: { url: ParsedUrl }) {
  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,183,197,0.6)', marginBottom: '1.5rem' }}>
        Chat: <code>{url.chatId}</code> · Página: <code>{url.namePage}</code> · Extra:{' '}
        <code>{url.extra}</code> ({url.extraName})
      </p>

      <p style={{ fontSize: '0.9rem' }}>
        Panel de grupo. Auth por grupo pendiente.
      </p>
    </div>
  );
}
