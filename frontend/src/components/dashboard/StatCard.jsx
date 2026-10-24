
import { ArrowRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';

const VARIANTS = {
  brand: {
    icon: 'bg-brand-50 text-brand-600 ring-brand-100',
    accent: 'bg-brand-500',
    decoration: 'bg-brand-50',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600 ring-blue-100',
    accent: 'bg-blue-500',
    decoration: 'bg-blue-50',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 ring-amber-100',
    accent: 'bg-amber-500',
    decoration: 'bg-amber-50',
  },
  purple: {
    icon: 'bg-violet-50 text-violet-600 ring-violet-100',
    accent: 'bg-violet-500',
    decoration: 'bg-violet-50',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    accent: 'bg-emerald-500',
    decoration: 'bg-emerald-50',
  },
  red: {
    icon: 'bg-rose-50 text-rose-600 ring-rose-100',
    accent: 'bg-rose-500',
    decoration: 'bg-rose-50',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600 ring-slate-200',
    accent: 'bg-slate-400',
    decoration: 'bg-slate-100',
  },
};

const TREND_CONFIG = {
  up: {
    Icon: TrendingUp,
    className: 'bg-emerald-50 text-emerald-700',
  },
  down: {
    Icon: TrendingDown,
    className: 'bg-rose-50 text-rose-700',
  },
  neutral: {
    Icon: Minus,
    className: 'bg-slate-100 text-slate-600',
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'brand',
  description,
  trend,
  trendDirection = 'neutral',
  onClick,
  className = '',
}) {
  const colors = VARIANTS[variant] ?? VARIANTS.brand;

  const trendConfig =
    TREND_CONFIG[trendDirection] ?? TREND_CONFIG.neutral;

  const TrendIcon = trendConfig.Icon;

  const isClickable = typeof onClick === 'function';

  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString()
      : value ?? '—';

  const content = (
    <>
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute -right-10 -top-12',
          'h-36 w-36 rounded-full opacity-60',
          colors.decoration,
        ].join(' ')}
      />

      <div
        aria-hidden="true"
        className={[
          'absolute bottom-0 left-6 right-6 h-[3px]',
          'rounded-t-full opacity-80',
          colors.accent,
        ].join(' ')}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            {formattedValue}
          </p>
        </div>

        {Icon && (
          <div
            className={[
              'flex h-12 w-12 shrink-0 items-center justify-center',
              'rounded-2xl ring-1 ring-inset',
              colors.icon,
            ].join(' ')}
          >
            <Icon
              size={23}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-5 flex min-h-6 items-center gap-2">
        {trend !== undefined && trend !== null && (
          <span
            className={[
              'inline-flex shrink-0 items-center gap-1',
              'rounded-full px-2 py-1 text-[11px] font-bold',
              trendConfig.className,
            ].join(' ')}
          >
            <TrendIcon
              size={12}
              strokeWidth={2.2}
              aria-hidden="true"
            />
            {trend}
          </span>
        )}

        {description && (
          <p className="min-w-0 truncate text-xs text-slate-400">
            {description}
          </p>
        )}

        {isClickable && (
          <ArrowRight
            size={16}
            className="ml-auto shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600"
            aria-hidden="true"
          />
        )}
      </div>
    </>
  );

  const cardClasses = [
    'group relative w-full overflow-hidden rounded-2xl',
    'border border-border-soft bg-white p-5 text-left',
    'shadow-sm transition-all duration-200',
    'sm:p-6',
    isClickable
      ? 'cursor-pointer hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cardClasses}
        aria-label={`View ${title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={cardClasses}>
      {content}
    </article>
  );
}
