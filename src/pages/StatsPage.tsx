import type { ParsedUrl } from '../lib/urlParser';

export function StatsPage({ url }: { url: ParsedUrl }) {
  return (
    <div style={{ padding: '3rem 1rem', maxWidth: 800, margin: '0 auto' }}>
      <h2
        style={{
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          color: '#FFB7C5',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        📊 Stats
      </h2>

      <p style={{ fontSize: '0.85rem', color: 'rgba(255,183,197,0.6)' }}>
        Página: <code>{url.namePage}</code>
        {url.chatId !== null && <> · Chat: <code>{url.chatId}</code></>}
      </p>
    </div>
  );
}
