import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-card border border-brand-border shadow-subtle overflow-hidden ${className}`}
      {...props}
    >
      {(title || action) && (
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            headerBorder ? 'border-b border-brand-border' : ''
          }`}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-brand-text">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
