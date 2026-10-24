
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Filter,
  RefreshCw,
  Ticket,
} from 'lucide-react';

import { api } from '../../lib/api';

import Button from '../../components/ui/Button';
import TicketFilters from '../../components/tickets/TicketFilters';
import TicketTable from '../../components/tickets/TicketTable';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

const INITIAL_FILTERS = {
  status: '',
  priority: '',
  categoryId: '',
};

function buildTicketsUrl(page, filters) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
  });

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  if (filters.categoryId) {
    params.set('categoryId', filters.categoryId);
  }

  return `/tickets/all?${params.toString()}`;
}

export default function AllTickets() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [ticketPage, setTicketPage] = useState(null);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [ticketError, setTicketError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const requestIdRef = useRef(0);

  const loadTickets = useCallback(
    async (pageNumber, selectedFilters, showLoader = true) => {
      const requestId = ++requestIdRef.current;

      if (showLoader) {
        setIsLoading(true);
        setIsRefreshing(false);
      } else {
        setIsRefreshing(true);
      }

      setTicketError('');

      try {
        const response = await api.get(
          buildTicketsUrl(pageNumber, selectedFilters)
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        setTicketPage(response);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setTicketError(
          error?.message ||
            'Unable to load tickets. Please try again.'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadTickets(page, filters);

    return () => {
      requestIdRef.current += 1;
    };
  }, [page, filters, loadTickets]);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setIsLoadingCategories(true);
      setCategoryError('');

      try {
        // ADMIN endpoint includes enabled and disabled categories.
        const response = await api.get('/categories/all');

        if (!active) {
          return;
        }

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.content)
            ? response.content
            : [];

        setCategories(categoryList);
      } catch (error) {
        if (!active) {
          return;
        }

        setCategoryError(
          error?.message ||
            'Unable to load categories for filtering.'
        );
      } finally {
        if (active) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  function handleFilterChange(nextFilters) {
    setPage(0);

    setFilters({
      status: nextFilters.status ?? '',
      priority: nextFilters.priority ?? '',
      categoryId: nextFilters.categoryId ?? '',
    });
  }

  function handleResetFilters() {
    setPage(0);
    setFilters({ ...INITIAL_FILTERS });
  }

  function handlePageChange(nextPage) {
    if (
      isLoading ||
      isRefreshing ||
      nextPage === page ||
      nextPage < 0 ||
      nextPage >= (ticketPage?.totalPages ?? 0)
    ) {
      return;
    }

    setPage(nextPage);
  }

  function handleRefresh() {
    if (isLoading || isRefreshing) {
      return;
    }

    loadTickets(page, filters, false);
  }

  const tickets = Array.isArray(ticketPage?.content)
    ? ticketPage.content
    : [];

  const totalElements = ticketPage?.totalElements ?? 0;
  const totalPages = ticketPage?.totalPages ?? 0;

  const activeFilterCount = [
    filters.status,
    filters.priority,
    filters.categoryId,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const isInitialError = Boolean(ticketError) && !ticketPage;

  return (
    <div className="page-container space-y-7 py-7 sm:py-9">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </nav>

      {/* Page header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <ClipboardList size={17} />
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Administrator Workspace
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            All Tickets
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review support requests across the system,
            filter by status or priority, and open tickets
            to manage assignments.
          </p>
        </div>

        <Button
          variant="secondary"
          leftIcon={RefreshCw}
          onClick={handleRefresh}
          loading={isRefreshing}
          disabled={isLoading}
        >
          Refresh Tickets
        </Button>
      </header>

      {/* Summary cards */}
      <section
        aria-label="Ticket listing summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="surface-card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Ticket size={23} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">
              Matching Tickets
            </p>

            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {isLoading && !ticketPage
                ? '—'
                : totalElements.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="surface-card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList size={23} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">
              Current Page
            </p>

            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {isLoading && !ticketPage
                ? '—'
                : totalPages === 0
                  ? '0 of 0'
                  : `${page + 1} of ${totalPages}`}
            </p>
          </div>
        </div>

        <div className="surface-card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Filter size={23} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">
              Active Filters
            </p>

            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {activeFilterCount}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <TicketFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        categories={categories}
        showStatus
        showPriority
        showCategory
        showSearch={false}
        loadingCategories={isLoadingCategories}
        disabled={isLoading || isRefreshing}
      />

      {/* Category loading error */}
      {categoryError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-xs leading-5 text-amber-800">
            {categoryError} Status and priority filters
            are still available.
          </p>
        </div>
      )}

      {/* Ticket loading error */}
      {ticketError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-600"
            />

            <p className="text-sm leading-6 text-rose-700">
              {ticketError}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => loadTickets(page, filters)}
            disabled={isLoading || isRefreshing}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Ticket listing */}
      {!isInitialError && (
        <div className="space-y-5">
          <TicketTable
            tickets={tickets}
            role="ADMIN"
            loading={isLoading}
            title={
              hasActiveFilters
                ? 'Filtered Tickets'
                : 'All Support Tickets'
            }
            description={
              isLoading
                ? 'Loading support requests...'
                : totalElements === 0 && hasActiveFilters
                  ? 'No tickets match the selected filters.'
                  : totalElements === 0
                    ? 'Support requests submitted by users will appear here.'
                    : `${totalElements.toLocaleString('en-IN')} ${
                        totalElements === 1 ? 'ticket' : 'tickets'
                      } found`
            }
            emptyTitle={
              hasActiveFilters
                ? 'No matching tickets'
                : 'No tickets in the system yet'
            }
            emptyDescription={
              hasActiveFilters
                ? 'Try changing or resetting your filters to find other tickets.'
                : 'Tickets created by users will appear here for review and assignment.'
            }
            emptyActionLabel={
              hasActiveFilters ? 'Clear Filters' : undefined
            }
            onEmptyAction={
              hasActiveFilters ? handleResetFilters : undefined
            }
          />

          {/* Server-side pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="surface-card px-4 py-4 sm:px-6">
              <Pagination
                page={page}
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
                loading={isRefreshing}
              />
            </div>
          )}
        </div>
      )}

      {/* Management guidance */}
      {!isLoading && !isInitialError && totalElements > 0 && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
          <h2 className="text-sm font-extrabold text-slate-900">
            Manage a Ticket
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-500">
            Open any ticket to review its details, assign
            or reassign an agent, update its priority, and
            view its activity history.
          </p>
        </div>
      )}
    </div>
  );
}
