
import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/20 active:bg-brand-800',

  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100',

  outline:
    'border border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50 active:bg-brand-100',

  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',

  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',

  'danger-outline':
    'border border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 active:bg-rose-100',
};

const sizes = {
  sm: 'min-h-9 gap-1.5 rounded-lg px-3 text-xs',
  md: 'min-h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'min-h-12 gap-2.5 rounded-xl px-5 text-sm',
  icon: 'h-10 w-10 rounded-xl p-0',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex shrink-0 items-center justify-center',
        'font-semibold leading-none whitespace-nowrap',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-4',
        'focus-visible:ring-brand-500/20',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          size={size === 'sm' ? 14 : 17}
          strokeWidth={2.2}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : LeftIcon ? (
        <LeftIcon
          size={size === 'sm' ? 14 : 17}
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : null}

      {children}

      {!loading && RightIcon ? (
        <RightIcon
          size={size === 'sm' ? 14 : 17}
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
});

export default Button;
