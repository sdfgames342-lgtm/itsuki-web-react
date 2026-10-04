import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { parseUrl, type ParsedUrl } from './lib/urlParser';
import { RouteGuard } from './router/RouteGuard';
import { ItalianLayout } from './layouts/ItalianLayout';
import { StealthLayout } from './layouts/StealthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicGameLayout } from './layouts/PublicGameLayout';
import { HomePage } from './pages/HomePage';
import { ControlPage } from './pages/ControlPage';
import { AdminPage } from './pages/AdminPage';
import { StatsPage } from './pages/StatsPage';
import { StealthPage } from './pages/StealthPage';
import { GamePage } from './pages/GamePage';
import { Fake404 } from './components/Fake404';

function renderByKind(url: ParsedUrl) {
  switch (url.kind) {
    case 'ctrl':
      return <StealthLayout><ControlPage url={url} /></StealthLayout>;
    case 'admin':
      return <AdminLayout><AdminPage url={url} /></AdminLayout>;
    case 'stats':
      return <ItalianLayout><StatsPage url={url} /></ItalianLayout>;
    case 'stealth':
      return <StealthLayout><StealthPage url={url} /></StealthLayout>;
    case 'game':
      return <PublicGameLayout><GamePage url={url} /></PublicGameLayout>;
  }
}

export function App() {
  const location = useLocation();

  const result = useMemo(
    () => parseUrl(location.pathname),
    [location.pathname],
  );

  const isRoot =
    location.pathname === '/' ||
    location.pathname === '' ||
    /^\/+$/.test(location.pathname);

  if (isRoot) return <HomePage />;

  if (!result.ok) return <Fake404 />;

  return (
    <RouteGuard url={result.url}>
      {renderByKind(result.url)}
    </RouteGuard>
  );
}
