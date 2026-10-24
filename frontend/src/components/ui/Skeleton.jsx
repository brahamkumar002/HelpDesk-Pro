
function Skeleton({
  className = '',
  width,
  height,
  rounded = 'lg',
  ...props
}) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={[
        'skeleton',
        roundedClasses[rounded] ?? roundedClasses.lg,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width,
        height,
      }}
      {...props}
    />
  );
}

export function DashboardSkeleton({ cards = 4 }) {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div
            key={index}
            className="surface-card space-y-5 p-5"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10" rounded="xl" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-32 max-w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="surface-card space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border-soft pb-4 last:border-0 last:pb-0"
            >
              <Skeleton className="h-10 w-10 shrink-0" rounded="xl" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 max-w-sm" />
                <Skeleton className="h-3 w-1/3 max-w-40" />
              </div>

              <Skeleton className="hidden h-6 w-20 sm:block" rounded="full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
  showHeader = true,
}) {
  const safeRows = Math.max(1, rows);
  const safeColumns = Math.max(1, columns);

  return (
    <div
      role="status"
      aria-label="Loading table"
      className="surface-card overflow-hidden"
    >
      {showHeader && (
        <div className="flex items-center justify-between gap-4 border-b border-border-soft px-5 py-5 sm:px-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex gap-6 border-b border-border-soft bg-slate-50/70 px-6 py-4">
            {Array.from({ length: safeColumns }, (_, index) => (
              <Skeleton
                key={index}
                className="h-3 min-w-0 flex-1"
              />
            ))}
          </div>

          {Array.from({ length: safeRows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center gap-6 border-b border-border-soft px-6 py-5 last:border-0"
            >
              {Array.from({ length: safeColumns }, (_, columnIndex) => (
                <div key={columnIndex} className="min-w-0 flex-1">
                  <Skeleton
                    className={[
                      'h-4',
                      columnIndex === 0 ? 'w-full' : 'w-3/4',
                    ].join(' ')}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TicketDetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading ticket details"
      className="space-y-6"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-3/4 max-w-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" rounded="full" />
          <Skeleton className="h-6 w-20" rounded="full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="surface-card space-y-5 p-6">
            <Skeleton className="h-5 w-36" />

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="surface-card space-y-5 p-6">
            <Skeleton className="h-5 w-32" />

            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-9 w-9 shrink-0" rounded="full" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card h-fit space-y-6 p-6">
          <Skeleton className="h-5 w-32" />

          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-36 max-w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
