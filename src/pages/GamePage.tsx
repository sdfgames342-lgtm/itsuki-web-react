import type { ParsedUrl } from '../lib/urlParser';

export function GamePage({ url }: { url: ParsedUrl }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            color: '#FFB7C5',
            fontSize: 'clamp(1.5rem, 5vw, 2.4rem)',
            marginBottom: '1rem',
          }}
        >
          ⟐ {url.gamePage} ⟐
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,183,197,0.6)' }}>
          {url.chatId !== null ? `Chat: ${url.chatId}` : 'Sin grupo'}
          {url.query && ` · ?${url.query}`}
        </p>
      </div>
    </div>
  );
}
