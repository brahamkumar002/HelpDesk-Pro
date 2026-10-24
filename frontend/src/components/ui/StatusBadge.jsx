
const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    className: 'bg-sky-50 text-sky-700 ring-sky-200/80',
    dotClassName: 'bg-sky-500',
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-violet-50 text-violet-700 ring-violet-200/80',
    dotClassName: 'bg-violet-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 ring-amber-200/80',
    dotClassName: 'bg-amber-500',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    dotClassName: 'bg-emerald-500',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dotClassName: 'bg-slate-400',
  },
};

const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dotClassName: 'bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-blue-50 text-blue-700 ring-blue-200/80',
    dotClassName: 'bg-blue-500',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-50 text-orange-700 ring-orange-200/80',
    dotClassName: 'bg-orange-500',
  },
  URGENT: {
    label: 'Urgent',
    className: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    dotClassName: 'bg-rose-500',
  },
};

function formatUnknownValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }

  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function StatusBadge({
  value,
  status,
  priority,
  type = 'status',
  size = 'md',
  showDot = true,
  className = '',
}) {
  // Supports both:
  // <StatusBadge value="OPEN" type="status" />
  // <StatusBadge status="OPEN" type="status" />
  // <StatusBadge priority="HIGH" type="priority" />

  const resolvedValue =
    value ?? (type === 'priority' ? priority : status);

  const normalizedValue = String(resolvedValue ?? '')
    .trim()
    .toUpperCase();

  const configMap =
    type === 'priority' ? PRIORITY_CONFIG : STATUS_CONFIG;

  const config = configMap[normalizedValue] ?? {
    label: formatUnknownValue(resolvedValue),
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dotClassName: 'bg-slate-400',
  };

  const sizeClasses = {
    sm: 'gap-1.5 px-2 py-0.5 text-[11px]',
    md: 'gap-1.5 px-2.5 py-1 text-xs',
    lg: 'gap-2 px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={[
        'inline-flex w-fit shrink-0 items-center',
        'rounded-full font-semibold leading-5',
        'ring-1 ring-inset whitespace-nowrap',
        config.className,
        sizeClasses[size] ?? sizeClasses.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className={[
            'h-1.5 w-1.5 shrink-0 rounded-full',
            config.dotClassName,
          ].join(' ')}
        />
      )}

      {config.label}
    </span>
  );
}
