import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium theme-text mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 border theme-rounded theme-text theme-surface
            focus:outline-none focus:ring-2 transition-colors
            ${error ? 'border-red-500 focus:ring-red-500' : 'border theme-border focus:ring-offset-0'}
            ${className}
          `}
          style={{
            '--tw-ring-color': 'var(--theme-primary)',
          } as React.CSSProperties}
          {...props}
        />
        {error && <p className="mt-1 text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm theme-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
