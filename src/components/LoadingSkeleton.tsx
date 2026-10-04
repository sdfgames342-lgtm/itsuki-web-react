export function LoadingSkeleton() {
  return (
    <main
      id="main-content"
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          opacity: 0.6,
        }}
      >
        <div style={{ height: 32, borderRadius: 6, background: 'rgba(255,183,197,0.2)', marginBottom: 12 }} />
        <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,183,197,0.12)', marginBottom: 8 }} />
        <div style={{ height: 16, width: '75%', borderRadius: 4, background: 'rgba(255,183,197,0.12)', marginBottom: 8 }} />
        <div style={{ height: 140, borderRadius: 6, background: 'rgba(255,183,197,0.1)' }} />
      </div>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        Cargando…
      </span>
    </main>
  );
}
