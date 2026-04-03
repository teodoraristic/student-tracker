export default function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          letterSpacing: '0.02em',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.09)'}`,
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '13px',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          outline: 'none',
          transition: 'border-color 0.15s',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{
          fontSize: '11px',
          color: '#f87171',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {error}
        </span>
      )}
    </div>
  );
}
