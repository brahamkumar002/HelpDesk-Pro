
import { Inbox } from 'lucide-react';

import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'There is currently no information to display.',
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  className = '',
}) {
  const hasPrimaryAction =
    Boolean(actionLabel) && typeof onAction === 'function';

  const hasSecondaryAction =
    Boolean(secondaryActionLabel) &&
    typeof onSecondaryAction === 'function';

  return (
    <div
      className={[
        'flex w-full flex-col items-center justify-center',
        'rounded-2xl border border-dashed border-slate-200',
        'bg-white px-5 text-center',
        compact ? 'py-10 sm:py-12' : 'py-14 sm:py-20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'relative flex items-center justify-center',
          'rounded-2xl border border-brand-100',
          'bg-gradient-to-br from-brand-50 to-white',
          'shadow-sm',
          compact ? 'h-14 w-14' : 'h-18 w-18',
        ].join(' ')}
      >
        <Icon
          size={compact ? 25 : 31}
          strokeWidth={1.6}
          className="text-brand-500"
          aria-hidden="true"
        />

        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-4 border-white bg-brand-200"
        />
      </div>

      <h3
        className={[
          'font-display font-bold tracking-tight text-slate-900',
          compact ? 'mt-4 text-base' : 'mt-6 text-lg',
        ].join(' ')}
      >
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {(hasPrimaryAction || hasSecondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {hasPrimaryAction && (
            <Button
              variant="primary"
              size="md"
              leftIcon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}

          {hasSecondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
