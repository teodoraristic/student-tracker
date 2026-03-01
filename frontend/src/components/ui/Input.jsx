export default function Input({ 
  label, 
  error, 
  style = {}, 
  ...props 
}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '6px', 
      width: '100%' 
    }}>
      {label && (
        <label style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#171717',
          fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          color: '#171717',
          fontSize: '16px',
          fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
          outline: 'none',
          transition: 'all 0.2s ease',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ 
          fontSize: '12px', 
          color: '#ef4444',
          fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
        }}>
          {error}
        </span>
      )}
    </div>
  );
}