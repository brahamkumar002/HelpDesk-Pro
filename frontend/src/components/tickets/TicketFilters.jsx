
import {
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold text-slate-600"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={[
            'h-11 w-full appearance-none rounded-xl',
            'border border-slate-200 bg-white',
            'px-3.5 pr-10 text-[13px] font-medium',
            'text-slate-700 outline-none',
            'transition-all duration-150',
            'hover:border-slate-300',
            'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
            'disabled:cursor-not-allowed disabled:bg-slate-50',
            'disabled:text-slate-400',
          ].join(' ')}
        >
          {options.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <SlidersHorizontal
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

export default function TicketFilters({
  filters = {},
  onChange,
  onReset,
  categories = [],
  showStatus = true,
  showPriority = true,
  showCategory = true,
  showSearch = false,
  disabled = false,
  loadingCategories = false,
  className = '',
}) {
  const status = filters.status ?? '';
  const priority = filters.priority ?? '';
  const categoryId = filters.categoryId ?? '';
  const search = filters.search ?? '';

  const hasActiveFilters =
    (showStatus && Boolean(status)) ||
    (showPriority && Boolean(priority)) ||
    (showCategory && Boolean(categoryId)) ||
    (showSearch && Boolean(search.trim()));

  const activeFilterCount = [
    showStatus && Boolean(status),
    showPriority && Boolean(priority),
    showCategory && Boolean(categoryId),
    showSearch && Boolean(search.trim()),
  ].filter(Boolean).length;

  const categoryOptions = [
    {
      value: '',
      label: loadingCategories
        ? 'Loading categories...'
        : 'All categories',
    },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];

  function updateFilter(name, value) {
    if (disabled || typeof onChange !== 'function') {
      return;
    }

    onChange({
      ...filters,
      [name]: value,
    });
  }

  function resetFilters() {
    if (
      disabled ||
      !hasActiveFilters ||
      typeof onReset !== 'function'
    ) {
      return;
    }

    onReset();
  }

  const hasDropdownFilters =
    showStatus || showPriority || showCategory;

  return (
    <section
      aria-label="Ticket filters"
      className={[
        'rounded-2xl border border-border-soft bg-white',
        'p-4 shadow-sm sm:p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Filter size={18} strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Filter Tickets
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Narrow down your ticket list
            </p>
          </div>

          {activeFilterCount > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-100 px-1.5 text-[11px] font-extrabold text-brand-700">
              {activeFilterCount}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            disabled={disabled || typeof onReset !== 'function'}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Reset filters
          </button>
        )}
      </div>

      {showSearch && (
        <div className={hasDropdownFilters ? 'mb-4' : ''}>
          <label
            htmlFor="ticket-filter-search"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Search tickets
          </label>

          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="ticket-filter-search"
              type="search"
              value={search}
              onChange={(event) =>
                updateFilter('search', event.target.value)
              }
              disabled={disabled}
              placeholder="Search tickets..."
              className={[
                'h-11 w-full rounded-xl border border-slate-200',
                'bg-white pl-11 pr-10 text-[13px] text-slate-700',
                'outline-none transition-all duration-150',
                'placeholder:text-slate-400',
                'hover:border-slate-300',
                'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                'disabled:cursor-not-allowed disabled:bg-slate-50',
              ].join(' ')}
            />

            {search && !disabled && (
              <button
                type="button"
                onClick={() => updateFilter('search', '')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {hasDropdownFilters && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showStatus && (
            <FilterSelect
              id="ticket-filter-status"
              label="Status"
              value={status}
              onChange={(value) => updateFilter('status', value)}
              options={STATUS_OPTIONS}
              disabled={disabled}
            />
          )}

          {showPriority && (
            <FilterSelect
              id="ticket-filter-priority"
              label="Priority"
              value={priority}
              onChange={(value) => updateFilter('priority', value)}
              options={PRIORITY_OPTIONS}
              disabled={disabled}
            />
          )}

          {showCategory && (
            <FilterSelect
              id="ticket-filter-category"
              label="Category"
              value={categoryId}
              onChange={(value) => updateFilter('categoryId', value)}
              options={categoryOptions}
              disabled={disabled || loadingCategories}
            />
          )}
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-soft pt-4">
          <span className="mr-1 text-[11px] font-semibold text-slate-400">
            Active filters:
          </span>

          {showStatus && status && (
            <button
              type="button"
              onClick={() => updateFilter('status', '')}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
            >
              {STATUS_OPTIONS.find((option) => option.value === status)
                ?.label ?? status}
              <X size={12} />
            </button>
          )}

          {showPriority && priority && (
            <button
              type="button"
              onClick={() => updateFilter('priority', '')}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
            >
              {PRIORITY_OPTIONS.find(
                (option) => option.value === priority
              )?.label ?? priority}
              <X size={12} />
            </button>
          )}

          {showCategory && categoryId && (
            <button
              type="button"
              onClick={() => updateFilter('categoryId', '')}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
            >
              {categories.find(
                (category) => String(category.id) === String(categoryId)
              )?.name ?? 'Selected category'}
              <X size={12} />
            </button>
          )}

          {showSearch && search.trim() && (
            <button
              type="button"
              onClick={() => updateFilter('search', '')}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
            >
              Search: {search.trim()}
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
