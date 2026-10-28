import { type ReactNode } from 'react';

export function StealthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh' }}>
      {children}
    </div>
  );
}
