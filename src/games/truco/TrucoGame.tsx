import { useState } from 'react';
import './truco.css';

const DEMO_HAND = ['1 espada', '7 oro', '3 copa', '12 basto', '5 espada', '2 oro'];

export function TrucoGame({ chatId }: { chatId: number | null }) {
  const [hand, setHand] = useState<string[]>(DEMO_HAND);
  const [played, setPlayed] = useState<string | null>(null);
  const [points, setPoints] = useState({ you: 0, rival: 0 });

  const play = (card: string) => {
    setPlayed(card);
    setHand((h) => h.filter((c) => c !== card));
    setPoints((p) => ({ ...p, you: p.you + 1 }));
  };
  const reset = () => { setHand(DEMO_HAND); setPlayed(null); };

  return (
    <div className="truco-root">
      <header className="truco-header">
        <span className="truco-badge">{chatId !== null ? `Chat ${chatId}` : 'Mesa local'}</span>
        <h1 className="truco-title">Truco</h1>
        <button type="button" className="truco-btn" onClick={reset}>Reiniciar</button>
      </header>
      <main className="truco-table">
        <div className="truco-score">
          <span>Vos <b>{points.you}</b></span>
          <span>Rival <b>{points.rival}</b></span>
        </div>
        <div className="truco-center">
          {played
            ? <div className="truco-card truco-card--played"><span>{played}</span></div>
            : <p className="truco-hint">Tirá una carta</p>}
        </div>
        <div className="truco-hand">
          {hand.map((card) => (
            <button key={card} type="button" className="truco-card"
                    onClick={() => play(card)} aria-label={`Tirar ${card}`}>
              <span>{card}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
