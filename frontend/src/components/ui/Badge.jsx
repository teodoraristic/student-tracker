export default function Badge({ variant = 'default', children, style = {}, ...props }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
  };

  const variants = {
    default: {
      backgroundColor: '#f5f5f5',
      color: '#737373',
    },
    primary: {
      backgroundColor: '#fff5f7',
      color: '#f43f5e',
    },
    success: {
      backgroundColor: '#d1fae5',
      color: '#059669',
    },
    warning: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
    },
    destructive: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
    },
  };

  return (
    <span style={{ ...baseStyles, ...variants[variant], ...style }} {...props}>
      {children}
    </span>
  );
}
