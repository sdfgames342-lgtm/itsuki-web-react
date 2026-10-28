import type { ParsedUrl } from '../lib/urlParser';

export function StealthPage({ url }: { url: ParsedUrl }) {
  return (
    <div style={{ padding: '3rem 1rem' }}>
      <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem' }}>
        Stealth · {url.namePage}
      </p>
    </div>
  );
}
