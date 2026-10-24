
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  Headphones,
  RefreshCw,
  Ticket,
} from 'lucide-react';

import { api } from '../../lib/api';

import Button from '../../components/ui/Button';
import TicketTable from '../../components/tickets/TicketTable';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

export default function AssignedTickets() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [ticketPage, setTicketPage] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const requestIdRef = useRef(0);

  const loadTickets = useCallback(
    async (pageNumber, showLoader = true) => {
      const requestId = ++requestIdRef.current;

      if (showLoader) {
        setIsLoading(true);
        setIsRefreshing(false);
      } else {
        setIsRefreshing(true);
      }

      setError('');

      try {
        const response = await api.get(
          `/tickets/assigned?page=${pageNumber}&size=${PAGE_SIZE}`
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        setTicketPage(response);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(
          err?.message ||
            'Unable to load assigned tickets. Please try again.'
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
    loadTickets(page);

    return () => {
      requestIdRef.current += 1;
    };
  }, [page, loadTickets]);

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

    loadTickets(page, false);
  }

  const tickets = Array.isArray(ticketPage?.content)
    ? ticketPage.content
    : [];

  const totalElements = ticketPage?.totalElements ?? 0;
  const totalPages = ticketPage?.totalPages ?? 0;

  const isInitialError = Boolean(error) && !ticketPage;

  return (
    <div className="page-container space-y-7 py-7 sm:py-9">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/agent/dashboard"
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
              Agent Workspace
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Assigned Tickets
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Review the support requests assigned to you,
            track their progress, and help users resolve issues.
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
        aria-label="Assigned ticket summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="surface-card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Ticket size={23} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">
              Total Assigned Tickets
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
            <ClipboardCheck size={23} />
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
      </section>

      {/* Error message */}
      {error && (
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
              {error}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => loadTickets(page)}
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
            role="AGENT"
            loading={isLoading}
            title="My Assigned Tickets"
            description={
              isLoading
                ? 'Loading assigned support requests...'
                : totalElements === 0
                  ? 'New assignments from an administrator will appear here.'
                  : `${totalElements.toLocaleString('en-IN')} ${
                      totalElements === 1 ? 'ticket' : 'tickets'
                    } assigned to you`
            }
            emptyTitle="No tickets assigned yet"
            emptyDescription="When an administrator assigns a support ticket to you, it will appear here."
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

      {/* Workflow guidance */}
      {!isLoading && !isInitialError && totalElements > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
              <Headphones size={20} />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Ready to work on a ticket?
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                Open a ticket to review its details, start
                working on the issue, add comments, or submit
                resolution notes when the issue is resolved.
              </p>
            </div>
          </div>

          <Link
            to="/agent/dashboard"
            className="inline-flex shrink-0 items-center gap-2 text-xs font-extrabold text-brand-700 transition-colors hover:text-brand-800"
          >
            Dashboard Overview
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
