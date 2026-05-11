import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium theme-text mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 border theme-rounded theme-text theme-surface
            focus:outline-none focus:ring-2 transition-colors resize-none
            ${error ? 'border-red-500 focus:ring-red-500' : 'border theme-border focus:ring-offset-0'}
            ${className}
          `}
          style={{
            '--tw-ring-color': 'var(--theme-primary)',
          } as React.CSSProperties}
          {...props}
        />
        {error && <p className="mt-1 text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
