
import { forwardRef, useId } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    name,
    id,
    value,
    error,
    hint,
    required = false,
    disabled = false,
    rows = 4,
    maxLength,
    showCount = false,
    resize = 'vertical',
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id || name || generatedId;

  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
    props['aria-describedby'],
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const characterCount = String(value ?? props.defaultValue ?? '').length;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="field-label">
          {label}

          {required && (
            <span className="ml-1 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          'field-input block min-h-28 leading-relaxed',
          resizeClasses[resize] ?? resizeClasses.vertical,
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {(hint || showCount) && (
        <div className="mt-1.5 flex items-start justify-between gap-3">
          {hint ? (
            <p
              id={hintId}
              className="text-xs leading-relaxed text-slate-500"
            >
              {hint}
            </p>
          ) : (
            <span />
          )}

          {showCount && (
            <span
              className="shrink-0 text-xs tabular-nums text-slate-400"
              aria-live="off"
            >
              {characterCount}
              {typeof maxLength === 'number' ? ` / ${maxLength}` : ''}
            </span>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;
