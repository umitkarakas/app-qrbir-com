import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium theme-text mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3 py-2 border theme-rounded theme-text theme-surface appearance-none
              focus:outline-none focus:ring-2 transition-colors pr-10
              ${error ? 'border-red-500 focus:ring-red-500' : 'border theme-border focus:ring-offset-0'}
              ${className}
            `}
            style={{
              '--tw-ring-color': 'var(--theme-primary)',
            } as React.CSSProperties}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-sm" style={{ color: 'var(--theme-error)' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
