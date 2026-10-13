import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  onClick,
  type = 'button',
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-primary-dark shadow-sm focus:ring-4 focus:ring-blue-100 active:scale-[0.98]',
    secondary:
      'bg-blue-50 text-primary hover:bg-blue-100 focus:ring-4 focus:ring-blue-50 active:scale-[0.98]',
    outline:
      'bg-white text-brand-text border border-brand-border hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 active:scale-[0.98]',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-4 focus:ring-rose-100 active:scale-[0.98]',
    ghost:
      'bg-transparent text-brand-muted hover:text-brand-text hover:bg-slate-100 focus:ring-2 focus:ring-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs min-h-[36px] px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm min-h-[44px] px-4 py-2.5 rounded-control gap-2 font-medium',
    lg: 'text-base min-h-[48px] px-5 py-3 rounded-control gap-2.5 font-semibold',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 outline-none select-none ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.primary} ${
        disabled ? disabledStyles : ''
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
};
