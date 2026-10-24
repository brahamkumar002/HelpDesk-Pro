
import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    name,
    id,
    error,
    hint,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    required = false,
    disabled = false,
    className = '',
    containerClassName = '',
    autoComplete,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || name || generatedId;

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
    props['aria-describedby'],
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}

          {required && (
            <span className="ml-1 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <LeftIcon
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        )}

        <input
          {...props}
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'field-input min-h-11',
            LeftIcon ? 'pl-11' : '',
            isPassword || RightIcon ? 'pr-11' : '',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
              : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-2.5 flex w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Eye size={18} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        ) : RightIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400">
            <RightIcon
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-slate-500">
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

export default Input;
