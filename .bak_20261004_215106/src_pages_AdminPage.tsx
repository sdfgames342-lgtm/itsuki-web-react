import { useState } from 'react';
import type { ParsedUrl } from '../lib/urlParser';
import { AdminLayout } from '../layouts/AdminLayout';
import { LiveFeed } from '../components/LiveFeed';
import { sb } from '../lib/supabase';

const SESSION_KEY = 'itsuki.session';

export function AdminPage({ url }: { url: ParsedUrl }) {
  const [tab, setTab] = useState('overview');

  const chatId = url.chatId ?? 0;

  const handleLogout = async () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token && sb) {
      try { await sb.rpc('web_logout', { p_session: token }); } catch { /* noop */ }
    }
    sessionStorage.clear();
    location.href = '/';
  };

  return (
    <AdminLayout
      chatId={chatId}
      tab={tab}
      onTabChange={setTab}
      onLogout={handleLogout}
    >
      {tab === 'overview' && <OverviewTab />}
      {tab === 'members'  && <MembersTab />}
      {tab === 'rules'    && <RulesTab />}
      {tab === 'settings' && <SettingsTab />}
    </AdminLayout>
  );
}

// ─── Tabs ──────────────────────────────────────────────

function OverviewTab() {
  return (
    <>
      <h2 style={styles.h2}>📊 Resumen del grupo</h2>
      <p style={styles.muted}>KPIs del grupo próximamente.</p>
      <LiveFeed />
    </>
  );
}

function MembersTab() {
  return (
    <>
      <h2 style={styles.h2}>👥 Miembros</h2>
      <p style={styles.muted}>Lista de admins del grupo.</p>
    </>
  );
}

function RulesTab() {
  return (
    <>
      <h2 style={styles.h2}>📜 Reglas</h2>
      <p style={styles.muted}>Editor de reglas del grupo.</p>
    </>
  );
}

function SettingsTab() {
  return (
    <>
      <h2 style={styles.h2}>⚙️ Ajustes</h2>
      <p style={styles.muted}>Configuración del panel.</p>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h2: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    color: '#FFB7C5',
    fontSize: '1.2rem',
    marginBottom: '0.75rem',
  },
  muted: {
    color: 'rgba(255,183,197,0.6)',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
};
