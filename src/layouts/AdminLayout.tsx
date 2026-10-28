import { useEffect, useState, type ReactNode } from 'react';

export interface AdminTab {
  key: string;
  label: string;
  icon: string;
}

export const ADMIN_TABS: AdminTab[] = [
  { key: 'overview', label: 'Resumen',  icon: '📊' },
  { key: 'members',  label: 'Miembros', icon: '👥' },
  { key: 'rules',    label: 'Reglas',   icon: '📜' },
  { key: 'settings', label: 'Ajustes',  icon: '⚙️' },
];

export interface AdminLayoutProps {
  chatId: number;
  chatTitle?: string;
  tab: string;
  onTabChange: (key: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AdminLayout({
  chatId, chatTitle, tab, onTabChange, onLogout, children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar sidebar al cambiar de tab (mobile)
  useEffect(() => { setMobileOpen(false); }, [tab]);

  // Bloquear scroll del body cuando sidebar está abierto en mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Escape cierra el sidebar
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <div style={styles.shell}>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          ...(mobileOpen ? styles.sidebarOpen : {}),
        }}
        aria-label="Navegación del panel"
      >
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarTitle}>Itsuki · Admin</span>
          <button
            type="button"
            style={styles.closeBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav style={styles.nav}>
          <ul style={styles.navList}>
            {ADMIN_TABS.map((t) => {
              const active = t.key === tab;
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    onClick={() => onTabChange(t.key)}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      ...styles.navItem,
                      ...(active ? styles.navItemActive : {}),
                    }}
                  >
                    <span style={styles.navIcon} aria-hidden="true">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={styles.sidebarFooter}>
          <span style={styles.chatBadge} title={`chat_id: ${chatId}`}>
            <code>{chatId}</code>
          </span>
        </div>
      </aside>

      {/* Content */}
      <div style={styles.content}>
        <header style={styles.topbar}>
          <button
            type="button"
            style={styles.hamburger}
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
          >
            ☰
          </button>
          <h1 style={styles.topbarTitle}>
            {chatTitle || `Grupo ${chatId}`}
          </h1>
          <button
            type="button"
            style={styles.logoutBtn}
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </header>

        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    minHeight: '100dvh',
    fontFamily: '"JetBrains Mono", monospace',
    color: '#f0e6e9',
    background: '#0a0809',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 40,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    width: 260,
    transform: 'translateX(-100%)',
    transition: 'transform 0.25s ease',
    background: 'rgba(15,12,14,0.98)',
    borderRight: '1px solid rgba(255,183,197,0.2)',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sidebarTitle: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    color: '#FFB7C5',
    fontSize: '1.1rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,183,197,0.7)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
  },
  nav: { flex: 1 },
  navList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'rgba(240,230,233,0.75)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.9rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  navItemActive: {
    background: 'rgba(255,183,197,0.15)',
    color: '#FFB7C5',
  },
  navIcon: { fontSize: '1.1rem' },
  sidebarFooter: {
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,183,197,0.15)',
  },
  chatBadge: {
    display: 'inline-block',
    padding: '0.3rem 0.6rem',
    background: 'rgba(255,183,197,0.1)',
    border: '1px solid rgba(255,183,197,0.25)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: 'rgba(255,183,197,0.7)',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,183,197,0.15)',
    background: 'rgba(15,12,14,0.9)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },
  hamburger: {
    background: 'transparent',
    border: '1px solid rgba(255,183,197,0.3)',
    borderRadius: '6px',
    color: '#FFB7C5',
    padding: '0.4rem 0.7rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  topbarTitle: {
    flex: 1,
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'rgba(255,183,197,0.85)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'transparent',
    color: '#FFB7C5',
    border: '1px solid rgba(255,183,197,0.4)',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    padding: '1.5rem',
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
  },
};
