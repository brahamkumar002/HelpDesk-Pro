
import { ArrowUpRight, CalendarDays, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { TableSkeleton } from '../ui/Skeleton';

const ROLE_TICKET_PATHS = {
  USER: '/user/tickets',
  AGENT: '/agent/tickets',
  ADMIN: '/admin/tickets',
};

function formatDate(dateString) {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTicketId(id) {
  if (id === null || id === undefined) {
    return '—';
  }

  return `#${String(id).padStart(4, '0')}`;
}

function getInitials(name) {
  if (!name) {
    return '?';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function PersonCell({ name }) {
  if (!name) {
    return (
      <span className="text-xs font-medium text-slate-400">
        Unassigned
      </span>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-extrabold text-brand-700 ring-1 ring-brand-100">
        {getInitials(name)}
      </div>

      <span className="max-w-40 truncate text-xs font-semibold text-slate-700">
        {name}
      </span>
    </div>
  );
}

function TicketRow({
  ticket,
  role,
  onOpen,
  showAssignee,
  showCreator,
}) {
  return (
    <tr className="group border-b border-border-soft transition-colors hover:bg-slate-50/70 last:border-b-0">
      <td className="px-5 py-4 align-middle sm:px-6">
        <button
          type="button"
          onClick={() => onOpen(ticket.id)}
          className="flex max-w-sm flex-col items-start gap-1.5 text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`View ticket ${formatTicketId(ticket.id)}: ${ticket.title}`}
        >
          <span className="text-[11px] font-bold tracking-wide text-brand-600">
            {formatTicketId(ticket.id)}
          </span>

          <span className="line-clamp-1 text-[13px] font-bold text-slate-900 transition-colors group-hover:text-brand-700">
            {ticket.title}
          </span>

          {ticket.categoryName && (
            <span className="max-w-64 truncate text-[11px] text-slate-400">
              {ticket.categoryName}
            </span>
          )}
        </button>
      </td>

      <td className="px-4 py-4 align-middle">
        <StatusBadge
          type="status"
          status={ticket.status}
          value={ticket.status}
          size="sm"
        />
      </td>

      <td className="px-4 py-4 align-middle">
        <StatusBadge
          type="priority"
          priority={ticket.priority}
          value={ticket.priority}
          size="sm"
        />
      </td>

      {showCreator && (
        <td className="px-4 py-4 align-middle">
          <PersonCell name={ticket.createdByName} />
        </td>
      )}

      {showAssignee && (
        <td className="px-4 py-4 align-middle">
          <PersonCell name={ticket.assignedToName} />
        </td>
      )}

      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500">
          <CalendarDays
            size={14}
            className="text-slate-400"
            aria-hidden="true"
          />
          {formatDate(ticket.createdAt)}
        </div>
      </td>

      <td className="px-5 py-4 text-right align-middle sm:px-6">
        <button
          type="button"
          onClick={() => onOpen(ticket.id)}
          aria-label={`Open ticket ${formatTicketId(ticket.id)}`}
          title="View ticket"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowUpRight size={17} strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}

function MobileTicketCard({ ticket, onOpen, showAssignee, showCreator }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(ticket.id)}
      className="group w-full border-b border-border-soft px-4 py-5 text-left transition-colors hover:bg-slate-50 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-5"
      aria-label={`View ticket ${formatTicketId(ticket.id)}: ${ticket.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-wide text-brand-600">
            {formatTicketId(ticket.id)}
          </p>

          <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-6 text-slate-900 group-hover:text-brand-700">
            {ticket.title}
          </h3>

          {ticket.categoryName && (
            <p className="mt-1 truncate text-xs text-slate-400">
              {ticket.categoryName}
            </p>
          )}
        </div>

        <ArrowUpRight
          size={17}
          className="mt-1 shrink-0 text-slate-400 group-hover:text-brand-600"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge
          type="status"
          status={ticket.status}
          value={ticket.status}
          size="sm"
        />

        <StatusBadge
          type="priority"
          priority={ticket.priority}
          value={ticket.priority}
          size="sm"
        />
      </div>

      {(showCreator || showAssignee) && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3">
          {showCreator && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Created by
              </span>
              <PersonCell name={ticket.createdByName} />
            </div>
          )}

          {showAssignee && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Assigned to
              </span>
              <PersonCell name={ticket.assignedToName} />
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <CalendarDays size={14} aria-hidden="true" />
        Created {formatDate(ticket.createdAt)}
      </div>
    </button>
  );
}

export default function TicketTable({
  tickets = [],
  role = 'USER',
  loading = false,
  title,
  description,
  headerAction,
  emptyTitle = 'No tickets found',
  emptyDescription = 'There are no tickets to display.',
  emptyActionLabel,
  onEmptyAction,
  className = '',
}) {
  const navigate = useNavigate();

  const showCreator = role === 'ADMIN';
  const showAssignee = role === 'USER' || role === 'ADMIN';

  const ticketBasePath =
    ROLE_TICKET_PATHS[role] ?? ROLE_TICKET_PATHS.USER;

  function handleOpenTicket(ticketId) {
    navigate(`${ticketBasePath}/${ticketId}`);
  }

  if (loading) {
    return (
      <TableSkeleton
        rows={6}
        columns={4 + Number(showCreator) + Number(showAssignee)}
        showHeader={Boolean(title)}
      />
    );
  }

  return (
    <section
      className={[
        'surface-card overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || description || headerAction) && (
        <div className="flex flex-col gap-4 border-b border-border-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-base font-extrabold tracking-tight text-slate-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>

          {headerAction && (
            <div className="shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="p-4 sm:p-6">
          <EmptyState
            icon={Ticket}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
            compact
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-border-soft bg-slate-50/70">
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:px-6"
                  >
                    Ticket
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    Status
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    Priority
                  </th>

                  {showCreator && (
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      Created By
                    </th>
                  )}

                  {showAssignee && (
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      Assigned To
                    </th>
                  )}

                  <th
                    scope="col"
                    className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    Created
                  </th>

                  <th
                    scope="col"
                    className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:px-6"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    role={role}
                    onOpen={handleOpenTicket}
                    showCreator={showCreator}
                    showAssignee={showAssignee}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile ticket cards */}
          <div className="md:hidden">
            {tickets.map((ticket) => (
              <MobileTicketCard
                key={ticket.id}
                ticket={ticket}
                onOpen={handleOpenTicket}
                showCreator={showCreator}
                showAssignee={showAssignee}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
