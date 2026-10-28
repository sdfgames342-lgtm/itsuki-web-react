import { useEffect, useRef, useState } from 'react';

const ACTIONS: { key: string; label: string; telegram?: boolean }[] = [
  { key: 'dictamen',  label: '💖 DICTAMEN' },
  { key: 'auditoria', label: '🌸 AUDITORÍA' },
  { key: 'status',    label: '🍭 STATUS' },
  { key: 'spqr',      label: '⚖️ SPQR' },
  { key: 'hablar',    label: '🤖 HABLAR', telegram: true },
];

export interface StickyHeaderProps {
  onAction: (key: string, telegram?: boolean) => void;
  onEasterEgg: () => void;
}

export function StickyHeader({ onAction, onEasterEgg }: StickyHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [menuOpen]);

  const handle = (key: string, telegram?: boolean) => {
    setMenuOpen(false);
    onAction(key, telegram);
  };

  return (
    <header className="sticky-header">
      <div className="header-container" ref={containerRef}>
        <button
          type="button"
          className="logo-area"
          onClick={onEasterEgg}
          aria-label="Avatar Itsuki — clic para easter egg"
        >
          <div className="avatar-mini">
            <img
              src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Itsuki&backgroundColor=ffb7c5"
              alt=""
              loading="lazy"
            />
            <span className="status-led-mini" aria-hidden="true" />
          </div>
          <h1 className="serif-title">Itsuki Mainframe</h1>
        </button>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Menú"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
        >
          ☰
        </button>

        <nav className="desktop-nav" aria-label="Menú principal">
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`btn-nav ${a.telegram ? 'btn-telegram' : ''}`}
              onClick={() => handle(a.key, a.telegram)}
            >
              {a.label}
            </button>
          ))}
        </nav>

        <div
          className={`mobile-menu ${menuOpen ? 'show' : ''}`}
          id="mobile-menu"
          role="menu"
        >
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              role="menuitem"
              className={`btn-mobile ${a.telegram ? 'btn-telegram' : ''}`}
              onClick={() => handle(a.key, a.telegram)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
