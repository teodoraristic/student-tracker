export default function Badge({ variant = 'default', children, style = {}, ...props }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 9px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '99px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: '0.02em',
  };

  const variants = {
    default: {
      backgroundColor: 'var(--surface-3)',
      color: 'var(--ink-3)',
    },
    primary: {
      backgroundColor: 'var(--rose-50)',
      color: 'var(--rose-500)',
    },
    success: {
      backgroundColor: 'var(--color-done-bg)',
      color: 'var(--color-done)',
    },
    warning: {
      backgroundColor: 'var(--color-due-soon-bg)',
      color: 'var(--color-due-soon)',
    },
    destructive: {
      backgroundColor: 'var(--color-overdue-bg)',
      color: 'var(--color-overdue)',
    },
  };

  return (
    <span style={{ ...baseStyles, ...variants[variant], ...style }} {...props}>
      {children}
    </span>
  );
}
