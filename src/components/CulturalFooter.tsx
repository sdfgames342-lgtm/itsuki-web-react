import { CULTURAL_HINTS } from '../lib/phrases';

export function CulturalFooter() {
  return (
    <footer className="footer-ledger">
      <div className="cultural-hints">
        {CULTURAL_HINTS.map((h, i) => (
          <span
            key={i}
            className="tooltip"
            data-tip={h.tip}
            tabIndex={0}
            role="img"
            aria-label={h.tip}
          >
            {h.emoji}
          </span>
        ))}
      </div>
      <div className="legal-quote">
        Dura lex, sed lex — <em>Itsuki Auditora</em> | v12.0 "Aurea"
      </div>
    </footer>
  );
}
