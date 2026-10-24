
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Button from './Button';

function getVisiblePages(currentPage, totalPages) {
  const pages = [];
  const siblingCount = 1;

  const start = Math.max(0, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);

  const addPage = (page) => {
    pages.push({
      type: 'page',
      value: page,
    });
  };

  const addEllipsis = (key) => {
    pages.push({
      type: 'ellipsis',
      value: key,
    });
  };

  if (start > 0) {
    addPage(0);

    if (start > 2) {
      addEllipsis('start');
    } else if (start === 2) {
      addPage(1);
    }
  }

  for (let page = start; page <= end; page++) {
    addPage(page);
  }

  if (end < totalPages - 1) {
    if (end < totalPages - 3) {
      addEllipsis('end');
    } else if (end === totalPages - 3) {
      addPage(totalPages - 2);
    }

    addPage(totalPages - 1);
  }

  return pages;
}

export default function Pagination({
  page = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  loading = false,
  itemLabel = 'tickets',
  className = '',
}) {
  if (totalPages <= 1) {
    return null;
  }

  const currentPage = Math.min(
    Math.max(0, page),
    totalPages - 1
  );

  const firstItem = currentPage * pageSize + 1;

  const lastItem = Math.min(
    (currentPage + 1) * pageSize,
    totalElements
  );

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const canGoPrevious = currentPage > 0 && !loading;
  const canGoNext = currentPage < totalPages - 1 && !loading;

  function handlePageChange(nextPage) {
    if (
      loading ||
      typeof onPageChange !== 'function' ||
      nextPage === currentPage ||
      nextPage < 0 ||
      nextPage >= totalPages
    ) {
      return;
    }

    onPageChange(nextPage);
  }

  return (
    <nav
      aria-label="Pagination"
      className={[
        'flex flex-col gap-4 border-t border-border-soft',
        'px-4 py-4 sm:flex-row sm:items-center',
        'sm:justify-between sm:px-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-center text-xs text-slate-500 sm:text-left">
        Showing{' '}
        <span className="font-semibold text-slate-700">
          {firstItem.toLocaleString()}
        </span>
        {' – '}
        <span className="font-semibold text-slate-700">
          {lastItem.toLocaleString()}
        </span>
        {' of '}
        <span className="font-semibold text-slate-700">
          {totalElements.toLocaleString()}
        </span>
        {' '}
        {itemLabel}
      </p>

      <div className="flex items-center justify-center gap-1.5">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Previous page"
          title="Previous page"
          className="h-9 w-9 rounded-lg"
        >
          <ChevronLeft size={17} />
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map((item) => {
            if (item.type === 'ellipsis') {
              return (
                <span
                  key={item.value}
                  className="flex h-9 w-7 items-center justify-center text-xs text-slate-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = item.value === currentPage;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handlePageChange(item.value)}
                disabled={loading}
                aria-label={`Go to page ${item.value + 1}`}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex h-9 min-w-9 items-center justify-center',
                  'rounded-lg px-2 text-xs font-semibold',
                  'transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-brand-500',
                  'disabled:cursor-not-allowed',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                {item.value + 1}
              </button>
            );
          })}
        </div>

        <span className="px-3 text-xs font-semibold text-slate-600 sm:hidden">
          Page {currentPage + 1} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
          title="Next page"
          className="h-9 w-9 rounded-lg"
        >
          <ChevronRight size={17} />
        </Button>
      </div>
    </nav>
  );
}
