export function Fake404() {
  return (
    <main
      id="main-content"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            color: '#FFB7C5',
            marginBottom: '1rem',
          }}
        >
          404
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,183,197,0.7)' }}>
          Página no encontrada.
        </p>
      </div>
    </main>
  );
}
