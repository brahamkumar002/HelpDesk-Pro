
import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    name,
    id,
    options = [],
    placeholder = 'Select an option',
    value,
    error,
    hint,
    required = false,
    disabled = false,
    loading = false,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || name || generatedId;

  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
    props['aria-describedby'],
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const isDisabled = disabled || loading;
  const isPlaceholderSelected =
    value !== undefined ? String(value) === '' : false;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}

          {required && (
            <span className="ml-1 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          {...props}
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          required={required}
          disabled={isDisabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'field-input min-h-11 appearance-none pr-11',
            isPlaceholderSelected ? 'text-slate-400' : 'text-slate-900',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
              : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {placeholder !== null && (
            <option value="" disabled={required}>
              {loading ? 'Loading options...' : placeholder}
            </option>
          )}

          {options.map((option) => {
            const normalizedOption =
              typeof option === 'string' || typeof option === 'number'
                ? {
                    value: option,
                    label: String(option),
                  }
                : option;

            return (
              <option
                key={String(normalizedOption.value)}
                value={normalizedOption.value}
                disabled={Boolean(normalizedOption.disabled)}
              >
                {normalizedOption.label}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={17}
          strokeWidth={1.9}
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {hint && (
        <p
          id={hintId}
          className="mt-1.5 text-xs leading-relaxed text-slate-500"
        >
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
