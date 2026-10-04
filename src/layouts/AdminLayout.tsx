import { type ReactNode } from 'react';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', padding: '2rem' }}>
      <h1
        style={{
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          color: '#FFB7C5',
          fontSize: '1.6rem',
          marginBottom: '1.5rem',
        }}
      >
        Itsuki · Admin
      </h1>
      {children}
    </div>
  );
}
