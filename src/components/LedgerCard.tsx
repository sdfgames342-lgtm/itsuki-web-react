import { useTypingEffect } from '../hooks/useTypingEffect';

export interface LedgerCardProps {
  output: string;
}

export function LedgerCard({ output }: LedgerCardProps) {
  const displayed = useTypingEffect(output, 20);

  return (
    <main className="main-ledger">
      <div className="ledger-card">
        <div className="ledger-border-top" aria-hidden="true">
          <span>╭─ ⟪ OUTPUT ⟫</span>
          <div className="ledger-line" />
          <span>╮</span>
        </div>

        <div
          className="output-mono"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {displayed || '⟐ ESCANEANDO ENTE BIOLÓGICO... ⟐'}
        </div>

        <div className="ledger-border-bottom" aria-hidden="true">
          <span>╰</span>
          <div className="ledger-line" />
          <span>╯</span>
        </div>
      </div>
    </main>
  );
}
