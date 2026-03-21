export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  style = {},
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--rose-400)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'var(--surface-3)',
      color: 'var(--ink)',
      border: '1px solid var(--border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--ink)',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--ink)',
    },
  };

  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: '13px',
      borderRadius: 'var(--r-sm)',
    },
    md: {
      padding: '7px 16px',
      fontSize: '13px',
      borderRadius: 'var(--r-md)',
    },
    lg: {
      padding: '10px 22px',
      fontSize: '14px',
      borderRadius: 'var(--r-lg)',
    },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
