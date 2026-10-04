import type { ParsedUrl } from '../lib/urlParser';

export function ControlPage({ url }: { url: ParsedUrl }) {
  return (
    <div style={{ padding: '3rem 1rem', maxWidth: 600, margin: '0 auto' }}>
      <h2
        style={{
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          color: '#FFB7C5',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        🔐 Panel de control
      </h2>

      <p style={{ fontSize: '0.85rem', color: 'rgba(255,183,197,0.6)', marginBottom: '1.5rem' }}>
        Página: <code>{url.namePage}</code> · Extra: <code>{url.extra}</code> ({url.extraName})
      </p>

      <p style={{ fontSize: '0.9rem' }}>
        Auth flow pendiente. Aquí va el código + password temporal.
      </p>
    </div>
  );
}
