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
    transition: 'all 0.2s ease',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
  };
  
  const variants = {
    primary: {
      backgroundColor: '#f43f5e',
      color: 'white',
      boxShadow: '0 2px 8px rgba(244, 63, 94, 0.2)',
    },
    secondary: {
      backgroundColor: '#f5f5f5',
      color: '#171717',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#171717',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid #e5e5e5',
      color: '#171717',
    },
  };
  
  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: '14px',
      borderRadius: '8px',
    },
    md: {
      padding: '10px 16px',
      fontSize: '16px',
      borderRadius: '12px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '18px',
      borderRadius: '16px',
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