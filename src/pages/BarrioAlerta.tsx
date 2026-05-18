interface Props { onBack: () => void; }

export default function BarrioAlerta({ onBack }: Props) {
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#080810',
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Header */}
      <div style={{
        background: '#0e0e1a',
        borderBottom: '1px solid #1e1e32',
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #2a2a42',
              borderRadius: 8, color: '#aaa',
              padding: '8px 16px', cursor: 'pointer',
              fontSize: 12, fontFamily: "'Courier New', monospace",
            }}
          >
            ← Volver
          </button>
          <div>
            <h1 style={{ color: '#e8e8ff', fontSize: 18, fontWeight: 900, margin: 0 }}>
              🚨 BarrioAlerta
            </h1>
            <p style={{ color: '#3a3a58', fontSize: 11, margin: '2px 0 0', letterSpacing: '0.15em' }}>
              MÓDULO EN CONSTRUCCIÓN
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 65px)',
        gap: 20, padding: '2rem',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 32px rgba(59,130,246,0.1)',
        }}>
          🚨
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#e8e8ff', fontSize: 22, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            BarrioAlerta
          </h2>
          <p style={{ color: '#3a3a58', fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 320 }}>
            Este módulo está en desarrollo.<br />
            Pronto podrás monitorear incidentes y reportes de la comunidad.
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: 10, color: '#60a5fa',
            padding: '12px 28px', cursor: 'pointer',
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Courier New', monospace",
            marginTop: 8,
          }}
        >
          ← Regresar al panel
        </button>
      </div>
    </div>
  );
}
