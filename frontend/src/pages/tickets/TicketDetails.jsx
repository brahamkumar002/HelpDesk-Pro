
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  MessageSquare,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Tag,
  Ticket,
  UserRound,
  UserRoundCheck,
} from 'lucide-react';

import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TicketDetailsSkeleton } from '../../components/ui/Skeleton';

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const ROLE_TICKET_PATHS = {
  USER: '/user/tickets',
  AGENT: '/agent/tickets',
  ADMIN: '/admin/tickets',
};

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatLabel(value) {
  if (!value) return '—';

  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInitials(name) {
  if (!name) return '?';

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
}

function InfoItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon size={17} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400">
          {label}
        </p>

        <div className="mt-1 break-words text-sm font-bold text-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment }) {
  const isAgent = comment.userRole === 'AGENT';
  const isAdmin = comment.userRole === 'ADMIN';

  return (
    <article className="flex gap-3 py-5">
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold',
          isAgent
            ? 'bg-blue-50 text-blue-700'
            : isAdmin
              ? 'bg-violet-50 text-violet-700'
              : 'bg-brand-50 text-brand-700',
        ].join(' ')}
      >
        {getInitials(comment.userName)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-extrabold text-slate-900">
            {comment.userName || 'Unknown User'}
          </span>

          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {formatLabel(comment.userRole)}
          </span>

          <span className="text-[11px] text-slate-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
          {comment.message}
        </p>
      </div>
    </article>
  );
}

function historyDisplayValue(fieldName, value, agentNames, ticket) {
  if (value == null) return null;

  const field = String(fieldName || '').replace(/[_\s-]/g, '').toLowerCase();
  if (field !== 'assignedto' && field !== 'assignedtoid') {
    return formatLabel(value);
  }

  const rawValue = String(value).trim();
  if (!rawValue || rawValue.toLowerCase() === 'null') return 'Unassigned';

  const agentName = agentNames.get(rawValue);
  if (agentName) return agentName;

  // The ticket response provides a verified name for its current assignee.
  if (String(ticket?.assignedToId ?? '') === rawValue && ticket?.assignedToName) {
    return ticket.assignedToName;
  }

  // Never invent a name for a historical ID that is not in the agent list.
  return `Agent #${rawValue}`;
}

function HistoryItem({ item, agentNames, ticket }) {
  const eventName =
    item.eventType || item.action || 'Ticket Updated';

  const actorName =
    item.changedByName || item.actorName || 'System';

  const date =
    item.changedAt || item.createdAt;

  return (
    <div className="relative border-l-2 border-slate-100 pb-6 pl-6 last:pb-0">
      <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full border-[3px] border-white bg-brand-500 ring-1 ring-brand-100" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-slate-900">
          {formatLabel(eventName)}
        </p>

        <span className="text-[11px] text-slate-400">
          {formatDate(date)}
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        By {actorName}
      </p>

      {item.fieldName && (
        <p className="mt-2 text-xs text-slate-500">
          Field: <strong>{formatLabel(item.fieldName)}</strong>
        </p>
      )}

      {(item.oldValue != null || item.newValue != null) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {item.oldValue != null && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-600">
              {historyDisplayValue(item.fieldName, item.oldValue, agentNames, ticket)}
            </span>
          )}

          <span className="text-slate-400">→</span>

          {item.newValue != null && (
            <span className="rounded-lg bg-brand-50 px-2.5 py-1.5 font-semibold text-brand-700">
              {historyDisplayValue(item.fieldName, item.newValue, agentNames, ticket)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const role = user?.role;
  const backPath = ROLE_TICKET_PATHS[role] || '/';

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyAgentNames, setHistoryAgentNames] = useState(new Map());

  const [agents, setAgents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [commentsError, setCommentsError] = useState('');
  const [historyError, setHistoryError] = useState('');

  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveError, setResolveError] = useState('');

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState('');

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [priorityError, setPriorityError] = useState('');

  const requestIdRef = useRef(0);

  const loadTicket = useCallback(
    async (showLoader = true) => {
      const requestId = ++requestIdRef.current;

      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError('');
      setCommentsError('');
      setHistoryError('');

      try {
        const ticketResponse = await api.get(`/tickets/${id}`);

        if (requestId !== requestIdRef.current) return;

        setTicket(ticketResponse);

        const secondaryRequests = [
          api
            .get(`/tickets/${id}/comments`)
            .then((data) => ({ type: 'comments', data }))
            .catch((err) => ({ type: 'commentsError', err })),
        ];

        if (role === 'ADMIN') {
          secondaryRequests.push(
            api
              .get(`/tickets/${id}/history`)
              .then((data) => ({ type: 'history', data }))
              .catch((err) => ({ type: 'historyError', err }))
          );

          // Include disabled agents so old assignment history still resolves.
          secondaryRequests.push(
            api
              .get('/admin/agents')
              .then((data) => ({ type: 'historyAgents', data }))
              .catch(() => ({ type: 'historyAgentsError' }))
          );
        }

        const results = await Promise.all(secondaryRequests);

        if (requestId !== requestIdRef.current) return;

        for (const result of results) {
          if (result.type === 'comments') {
            setComments(normalizeList(result.data));
          }

          if (result.type === 'commentsError') {
            setCommentsError(
              result.err?.message || 'Unable to load comments.'
            );
          }

          if (result.type === 'history') {
            setHistory(normalizeList(result.data));
          }

          if (result.type === 'historyError') {
            setHistoryError(
              result.err?.message || 'Unable to load history.'
            );
          }

          if (result.type === 'historyAgents') {
            const names = new Map();
            for (const agent of normalizeList(result.data)) {
              if (agent?.id != null && agent?.fullName) {
                names.set(String(agent.id), agent.fullName);
              }
            }
            setHistoryAgentNames(names);
          }

          if (result.type === 'historyAgentsError') {
            // History remains visible even if the name lookup fails.
            setHistoryAgentNames(new Map());
          }
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        setError(
          err?.message ||
            'Unable to load ticket details. Please try again.'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [id, role]
  );

  useEffect(() => {
    loadTicket();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadTicket]);

  async function runAction(endpoint, payload, successMessage) {
    if (isActionLoading) return false;

    setIsActionLoading(true);

    try {
      await api.patch(endpoint, payload);

      toast.success(successMessage);

      setConfirmAction(null);
      setIsResolveOpen(false);
      setIsAssignOpen(false);
      setIsPriorityOpen(false);

      await loadTicket(false);

      return true;
    } catch (err) {
      toast.error(
        err?.message || 'Unable to update ticket. Please try again.'
      );

      return false;
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleSendComment(event) {
    event.preventDefault();

    const message = commentText.trim();

    if (!message || isSendingComment) return;

    setIsSendingComment(true);

    try {
      await api.post(`/tickets/${id}/comments`, { message });

      setCommentText('');
      toast.success('Comment added successfully.');

      await loadTicket(false);
    } catch (err) {
      toast.error(
        err?.message || 'Unable to add comment. Please try again.'
      );
    } finally {
      setIsSendingComment(false);
    }
  }

  async function openAssignModal() {
    setSelectedAgentId(
      ticket?.assignedToId
        ? String(ticket.assignedToId)
        : ''
    );

    setAgentsError('');
    setIsAssignOpen(true);
    setIsLoadingAgents(true);

    try {
      const response = await api.get('/admin/agents/enabled');
      setAgents(normalizeList(response));
    } catch (err) {
      setAgentsError(
        err?.message || 'Unable to load available agents.'
      );
    } finally {
      setIsLoadingAgents(false);
    }
  }

  async function handleAssign(event) {
    event.preventDefault();

    if (!selectedAgentId) {
      setAgentsError('Please select an agent.');
      return;
    }

    setAgentsError('');

    await runAction(
      `/tickets/${id}/assign`,
      { agentId: Number(selectedAgentId) },
      'Ticket assigned successfully.'
    );
  }

  async function handlePriorityUpdate(event) {
    event.preventDefault();

    if (!selectedPriority) {
      setPriorityError('Please select a priority.');
      return;
    }

    setPriorityError('');

    await runAction(
      `/tickets/${id}/priority`,
      { priority: selectedPriority },
      'Ticket priority updated successfully.'
    );
  }

  async function handleResolve(event) {
    event.preventDefault();

    if (!resolutionNotes.trim()) {
      setResolveError('Resolution notes are required.');
      return;
    }

    setResolveError('');

    await runAction(
      `/tickets/${id}/resolve`,
      { resolutionNotes: resolutionNotes.trim() },
      'Ticket resolved successfully.'
    );
  }

  function handleConfirmedAction() {
    if (!confirmAction) return;

    runAction(
      `/tickets/${id}/${confirmAction.endpoint}`,
      undefined,
      confirmAction.successMessage
    );
  }

  const isUser = role === 'USER';
  const isAgent = role === 'AGENT';
  const isAdmin = role === 'ADMIN';

  const canComment =
    (isUser || isAgent) && ticket?.status !== 'CLOSED';

  const canStart =
    isAgent && ticket?.status === 'ASSIGNED';

  const canResolve =
    isAgent && ticket?.status === 'IN_PROGRESS';

  const canClose =
    isUser && ticket?.status === 'RESOLVED';

  const canReopen =
    isUser && ticket?.status === 'RESOLVED';

  const canAssign =
    isAdmin && ticket?.status !== 'CLOSED';

  const canChangePriority =
    isAdmin && ticket?.status !== 'CLOSED';

  if (isLoading && !ticket) {
    return (
      <div className="page-container py-8">
        <TicketDetailsSkeleton />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="page-container py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle size={26} />
          </div>

          <h2 className="mt-5 font-display text-xl font-extrabold text-slate-900">
            Unable to load ticket
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => loadTicket()}
            >
              Try Again
            </Button>

            <Link
              to={backPath}
              className="inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-bold text-brand-600 hover:bg-brand-50"
            >
              Back to Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="page-container space-y-7 py-7 sm:py-9">
      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft size={15} />
          Back to Tickets
        </Link>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={RefreshCw}
          onClick={() => loadTicket(false)}
          loading={isRefreshing}
          disabled={isLoading || isActionLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Page heading */}
      <header className="surface-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-extrabold text-brand-700">
            <Ticket size={14} />
            Ticket #{ticket.id}
          </span>

          <StatusBadge
            status={ticket.status}
            type="status"
          />

          <StatusBadge
            priority={ticket.priority}
            type="priority"
          />
        </div>

        <h1 className="mt-5 break-words font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {ticket.title}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={15} />
          Created {formatDate(ticket.createdAt)}
        </p>

        {/* Role-based actions */}
        {(canStart ||
          canResolve ||
          canClose ||
          canReopen ||
          canAssign ||
          canChangePriority) && (
          <div className="mt-6 flex flex-wrap gap-2.5 border-t border-border-soft pt-5">
            {canStart && (
              <Button
                variant="primary"
                leftIcon={Play}
                disabled={isActionLoading}
                onClick={() =>
                  setConfirmAction({
                    endpoint: 'start',
                    title: 'Start Working on Ticket?',
                    description:
                      'This ticket will move to In Progress.',
                    confirmText: 'Start Work',
                    successMessage: 'Ticket moved to In Progress.',
                  })
                }
              >
                Start Work
              </Button>
            )}

            {canResolve && (
              <Button
                variant="primary"
                leftIcon={CheckCircle2}
                disabled={isActionLoading}
                onClick={() => {
                  setResolutionNotes('');
                  setResolveError('');
                  setIsResolveOpen(true);
                }}
              >
                Resolve Ticket
              </Button>
            )}

            {canClose && (
              <Button
                variant="primary"
                leftIcon={CheckCircle2}
                disabled={isActionLoading}
                onClick={() =>
                  setConfirmAction({
                    endpoint: 'close',
                    title: 'Close This Ticket?',
                    description:
                      'Confirm that the issue has been resolved and close the ticket.',
                    confirmText: 'Close Ticket',
                    successMessage: 'Ticket closed successfully.',
                  })
                }
              >
                Close Ticket
              </Button>
            )}

            {canReopen && (
              <Button
                variant="outline"
                leftIcon={RotateCcw}
                disabled={isActionLoading}
                onClick={() =>
                  setConfirmAction({
                    endpoint: 'reopen',
                    title: 'Reopen This Ticket?',
                    description:
                      'The ticket will move back to In Progress for further assistance.',
                    confirmText: 'Reopen Ticket',
                    successMessage: 'Ticket reopened successfully.',
                  })
                }
              >
                Reopen
              </Button>
            )}

            {canAssign && (
              <Button
                variant="primary"
                leftIcon={UserRoundCheck}
                disabled={isActionLoading}
                onClick={openAssignModal}
              >
                {ticket.assignedToId
                  ? 'Reassign Agent'
                  : 'Assign Agent'}
              </Button>
            )}

            {canChangePriority && (
              <Button
                variant="outline"
                leftIcon={Tag}
                disabled={isActionLoading}
                onClick={() => {
                  setSelectedPriority(ticket.priority || '');
                  setPriorityError('');
                  setIsPriorityOpen(true);
                }}
              >
                Change Priority
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Refresh error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Main content */}
        <div className="min-w-0 space-y-6 xl:col-span-2">
          {/* Description */}
          <section className="surface-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <FileText size={19} className="text-brand-600" />

              <h2 className="font-display text-base font-extrabold text-slate-900">
                Ticket Description
              </h2>
            </div>

            <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-8 text-slate-600">
              {ticket.description || 'No description provided.'}
            </div>
          </section>

          {/* Resolution notes */}
          {ticket.resolutionNotes && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={19}
                  className="text-emerald-600"
                />

                <h2 className="font-display text-base font-extrabold text-emerald-900">
                  Resolution Notes
                </h2>
              </div>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-emerald-800">
                {ticket.resolutionNotes}
              </p>
            </section>
          )}

          {/* Comments */}
          <section className="surface-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border-soft px-5 py-5 sm:px-6">
              <MessageSquare
                size={19}
                className="text-brand-600"
              />

              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  Conversation
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Comments and updates on this ticket
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6">
              {commentsError && (
                <div
                  role="alert"
                  className="my-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700"
                >
                  {commentsError}
                </div>
              )}

              {!commentsError && comments.length === 0 && (
                <div className="py-10 text-center">
                  <MessageSquare
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No comments yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Ticket conversation will appear here.
                  </p>
                </div>
              )}

              {comments.length > 0 && (
                <div className="divide-y divide-border-soft">
                  {comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </div>
              )}
            </div>

            {canComment && (
              <form
                onSubmit={handleSendComment}
                className="space-y-4 border-t border-border-soft bg-slate-50/50 p-5 sm:p-6"
              >
                <Textarea
                  label="Add a Comment"
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(event.target.value)
                  }
                  placeholder="Write a helpful update about this ticket..."
                  rows={3}
                  disabled={isSendingComment}
                  required
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={Send}
                    loading={isSendingComment}
                    disabled={!commentText.trim()}
                  >
                    Send Comment
                  </Button>
                </div>
              </form>
            )}

            {!canComment && ticket.status === 'CLOSED' && (
              <div className="border-t border-border-soft bg-slate-50 px-5 py-4 text-xs font-medium text-slate-500 sm:px-6">
                This ticket is closed. New comments are disabled.
              </div>
            )}
          </section>

          {/* Admin history */}
          {isAdmin && (
            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <History size={19} className="text-brand-600" />

                <h2 className="font-display text-base font-extrabold text-slate-900">
                  Ticket Activity History
                </h2>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Recorded changes to this support ticket
              </p>

              {historyError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700"
                >
                  {historyError}
                </div>
              )}

              {!historyError && history.length === 0 && (
                <p className="mt-6 text-sm text-slate-500">
                  No history entries available.
                </p>
              )}

              {history.length > 0 && (
                <div className="mt-7">
                  {history.map((item, index) => (
                    <HistoryItem
                      key={item.id ?? index}
                      item={item}
                      agentNames={historyAgentNames}
                      ticket={ticket}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Ticket information */}
        <aside className="space-y-6">
          <section className="surface-card p-5 sm:p-6">
            <h2 className="font-display text-base font-extrabold text-slate-900">
              Ticket Information
            </h2>

            <div className="mt-6 space-y-6">
              <InfoItem icon={Tag} label="Category">
                {ticket.categoryName || '—'}
              </InfoItem>

              <InfoItem icon={UserRound} label="Created By">
                {ticket.createdByName || '—'}
              </InfoItem>

              <InfoItem icon={UserRoundCheck} label="Assigned Agent">
                {ticket.assignedToName || 'Not assigned yet'}
              </InfoItem>

              <InfoItem icon={Clock3} label="Last Updated">
                {formatDate(ticket.updatedAt)}
              </InfoItem>

              {ticket.resolvedAt && (
                <InfoItem
                  icon={CheckCircle2}
                  label="Resolved At"
                >
                  {formatDate(ticket.resolvedAt)}
                </InfoItem>
              )}

              {ticket.closedAt && (
                <InfoItem
                  icon={ShieldCheck}
                  label="Closed At"
                >
                  {formatDate(ticket.closedAt)}
                </InfoItem>
              )}
            </div>
          </section>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-6 text-white">
            <ShieldCheck size={25} />

            <h3 className="mt-4 font-display text-lg font-extrabold">
              HelpDesk Pro
            </h3>

            <p className="mt-2 text-xs leading-6 text-indigo-100">
              Track support requests and keep communication
              organized throughout the resolution process.
            </p>
          </div>
        </aside>
      </div>

      {/* Confirm status action */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => {
          if (!isActionLoading) {
            setConfirmAction(null);
          }
        }}
        onConfirm={handleConfirmedAction}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmText={confirmAction?.confirmText || 'Confirm'}
        variant="default"
        loading={isActionLoading}
      />

      {/* Resolve modal */}
      <Modal
        isOpen={isResolveOpen}
        onClose={() => {
          if (!isActionLoading) setIsResolveOpen(false);
        }}
        title="Resolve Ticket"
        description="Explain how the issue was resolved."
        size="md"
      >
        <form onSubmit={handleResolve} className="space-y-5">
          {resolveError && (
            <p role="alert" className="text-xs text-rose-600">
              {resolveError}
            </p>
          )}

          <Textarea
            label="Resolution Notes"
            value={resolutionNotes}
            onChange={(event) => {
              setResolutionNotes(event.target.value);
              setResolveError('');
            }}
            placeholder="Describe the solution provided..."
            rows={5}
            required
            disabled={isActionLoading}
          />

          <div className="flex justify-end gap-3 border-t border-border-soft pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={isActionLoading}
              onClick={() => setIsResolveOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              leftIcon={CheckCircle2}
              loading={isActionLoading}
            >
              Resolve Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign agent modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => {
          if (!isActionLoading) setIsAssignOpen(false);
        }}
        title="Assign Support Agent"
        description="Select an enabled agent to handle this ticket."
        size="md"
      >
        <form onSubmit={handleAssign} className="space-y-5">
          {agentsError && (
            <p role="alert" className="text-xs text-rose-600">
              {agentsError}
            </p>
          )}

          <Select
            label="Support Agent"
            value={selectedAgentId}
            onChange={(event) => {
              setSelectedAgentId(event.target.value);
              setAgentsError('');
            }}
            options={agents.map((agent) => ({
              value: String(agent.id),
              label: `${agent.fullName} (${agent.email})`,
            }))}
            placeholder="Select an agent"
            loading={isLoadingAgents}
            disabled={isLoadingAgents || isActionLoading}
            required
          />

          <div className="flex justify-end gap-3 border-t border-soft pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={isActionLoading}
              onClick={() => setIsAssignOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              leftIcon={UserRoundCheck}
              loading={isActionLoading}
              disabled={isLoadingAgents || agents.length === 0}
            >
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Priority modal */}
      <Modal
        isOpen={isPriorityOpen}
        onClose={() => {
          if (!isActionLoading) setIsPriorityOpen(false);
        }}
        title="Change Ticket Priority"
        description="Update the urgency level of this support request."
        size="md"
      >
        <form
          onSubmit={handlePriorityUpdate}
          className="space-y-5"
        >
          {priorityError && (
            <p role="alert" className="text-xs text-rose-600">
              {priorityError}
            </p>
          )}

          <Select
            label="Priority"
            value={selectedPriority}
            onChange={(event) => {
              setSelectedPriority(event.target.value);
              setPriorityError('');
            }}
            options={PRIORITIES}
            placeholder="Select priority"
            required
            disabled={isActionLoading}
          />

          <div className="flex justify-end gap-3 border-t border-soft pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={isActionLoading}
              onClick={() => setIsPriorityOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              leftIcon={Tag}
              loading={isActionLoading}
            >
              Update Priority
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
