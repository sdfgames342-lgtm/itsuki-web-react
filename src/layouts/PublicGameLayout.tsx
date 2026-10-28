import { type ReactNode } from 'react';

export function PublicGameLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}
