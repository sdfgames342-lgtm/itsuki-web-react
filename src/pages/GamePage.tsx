import { Suspense } from 'react';
import type { ParsedUrl } from '../lib/urlParser';
import { getGame } from '../games';

export function GamePage({ url }: { url: ParsedUrl }) {
  const game = getGame(url.gamePage);
  if (!game) return <GameFallback url={url} />;
  const Game = game.Component;
  return (
    <Suspense fallback={<div style={styles.center}><p style={styles.muted}>Cargando {game.title}…</p></div>}>
      <Game chatId={url.chatId ?? null} />
    </Suspense>
  );
}
function GameFallback({ url }: { url: ParsedUrl }) {
  return (
    <div style={styles.center}>
      <div>
        <h1 style={styles.h1}>⟐ {url.gamePage ?? 'juego'} ⟐</h1>
        <p style={styles.muted}>
          {url.chatId !== null ? `Chat: ${url.chatId}` : 'Sin grupo'}
          {url.query && ` · ?${url.query}`}
        </p>
      </div>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  center: { flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            padding:'2rem', textAlign:'center', minHeight:'60dvh' },
  h1: { fontFamily:'"Playfair Display", serif', fontStyle:'italic',
        color:'#FFB7C5', fontSize:'clamp(1.5rem, 5vw, 2.4rem)', marginBottom:'1rem' },
  muted: { fontSize:'.85rem', color:'rgba(255,183,197,.6)',
           fontFamily:'"JetBrains Mono", monospace' },
};
