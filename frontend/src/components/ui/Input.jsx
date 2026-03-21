export default function Input({
  label,
  error,
  style = {},
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--ink)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          color: 'var(--ink)',
          fontSize: '13px',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{
          fontSize: '12px',
          color: 'var(--color-overdue)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {error}
        </span>
      )}
    </div>
  );
}
