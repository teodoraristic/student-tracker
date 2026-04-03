export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  style = {},
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: '-0.01em',
  };

  const variants = {
    primary: {
      backgroundColor: '#f49585',
      color: '#0f0f0f',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.75)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'rgba(255,255,255,0.6)',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'rgba(255,255,255,0.75)',
    },
    danger: {
      backgroundColor: 'rgba(248,113,113,0.12)',
      color: '#f87171',
      border: '1px solid rgba(248,113,113,0.2)',
    },
  };

  const sizes = {
    sm: { padding: '5px 12px',  fontSize: '12px', borderRadius: '8px' },
    md: { padding: '8px 16px',  fontSize: '13px', borderRadius: '10px' },
    lg: { padding: '11px 24px', fontSize: '14px', borderRadius: '12px' },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...sizes[size], ...style }} {...props}>
      {children}
    </button>
  );
}
