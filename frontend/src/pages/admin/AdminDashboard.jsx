
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Ticket,
  Timer,
  UserCog,
  Users,
} from 'lucide-react';

import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

import Button from '../../components/ui/Button';
import StatCard from '../../components/dashboard/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const RECENT_TICKETS_LIMIT = 5;

function getCount(value) {
  const count = Number(value);

  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function getFirstName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return 'Admin';
  }

  return fullName.trim().split(/\s+/)[0] || 'Admin';
}

function ManagementLink({
  to,
  icon: Icon,
  title,
  description,
  color = 'brand',
}) {
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-violet-50 text-violet-600',
  };

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
    >
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          colorClasses[color] ?? colorClasses.brand,
        ].join(' ')}
      >
        <Icon size={20} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600"
        aria-hidden="true"
      />
    </Link>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(async (showLoader = true) => {
    const requestId = ++requestIdRef.current;

    if (showLoader) {
      setIsLoading(true);
      setIsRefreshing(false);
    } else {
      setIsRefreshing(true);
    }

    setError('');

    try {
      const [dashboardResponse, ticketsResponse] =
        await Promise.all([
          api.get('/dashboard'),
          api.get(
            `/tickets/all?page=0&size=${RECENT_TICKETS_LIMIT}`
          ),
        ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setDashboard(dashboardResponse);

      setRecentTickets(
        Array.isArray(ticketsResponse?.content)
          ? ticketsResponse.content
          : []
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        err?.message ||
          'Unable to load the admin dashboard. Please try again.'
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDashboard]);

  function handleRefresh() {
    if (isLoading || isRefreshing) {
      return;
    }

    loadDashboard(false);
  }

  const firstName = getFirstName(user?.fullName);

  const totalTickets = getCount(dashboard?.totalTickets);
  const openTickets = getCount(dashboard?.openTickets);
  const assignedTickets = getCount(dashboard?.assignedTickets);
  const inProgressTickets = getCount(dashboard?.inProgressTickets);
  const resolvedTickets = getCount(dashboard?.resolvedTickets);
  const closedTickets = getCount(dashboard?.closedTickets);

  const activeTickets =
    openTickets + assignedTickets + inProgressTickets;

  const completedTickets = resolvedTickets + closedTickets;

  const completionPercentage =
    totalTickets > 0
      ? Math.min(
          100,
          Math.round((completedTickets / totalTickets) * 100)
        )
      : 0;

  if (isLoading && !dashboard) {
    return (
      <div className="page-container py-8">
        <DashboardSkeleton cards={4} />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="page-container py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle size={26} />
          </div>

          <h2 className="mt-5 font-display text-xl font-extrabold text-slate-900">
            Couldn't load the admin dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              leftIcon={RefreshCw}
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-7 py-7 sm:py-9">
      {/* Page header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck
              size={15}
              className="text-brand-600"
              aria-hidden="true"
            />

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Administrator Workspace
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {firstName}
            <span className="ml-2">👋</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor support operations, manage ticket assignments,
            and oversee your helpdesk team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            leftIcon={RefreshCw}
            onClick={handleRefresh}
            loading={isRefreshing}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            leftIcon={Ticket}
            onClick={() => navigate('/admin/tickets')}
          >
            Manage Tickets
          </Button>
        </div>
      </header>

      {/* Refresh error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-rose-600"
          />

          <div>
            <p className="text-sm font-semibold text-rose-700">
              {error}
            </p>

            <p className="mt-1 text-xs text-rose-600">
              Showing the last successfully loaded data.
            </p>
          </div>
        </div>
      )}

      {/* Main statistics */}
      <section aria-label="System ticket statistics">
        <div className="mb-4">
          <h2 className="font-display text-base font-extrabold text-slate-900">
            System Overview
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Live ticket statistics across the helpdesk
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={Ticket}
            variant="brand"
            description="All support requests"
            onClick={() => navigate('/admin/tickets')}
          />

          <StatCard
            title="Open Tickets"
            value={openTickets}
            icon={Clock3}
            variant="amber"
            description="Waiting for assignment"
            onClick={() => navigate('/admin/tickets')}
          />

          <StatCard
            title="In Progress"
            value={inProgressTickets}
            icon={Timer}
            variant="blue"
            description="Being handled by agents"
            onClick={() => navigate('/admin/tickets')}
          />

          <StatCard
            title="Resolved"
            value={resolvedTickets}
            icon={CheckCircle2}
            variant="green"
            description="Successfully resolved"
            onClick={() => navigate('/admin/tickets')}
          />
        </div>
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Recent tickets */}
        <section className="min-w-0 xl:col-span-2">
          <TicketTable
            tickets={recentTickets}
            role="ADMIN"
            title="Recent Support Tickets"
            description="Latest tickets across the helpdesk"
            headerAction={
              <Link
                to="/admin/tickets"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 transition-colors hover:text-brand-700"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            }
            emptyTitle="No tickets in the system yet"
            emptyDescription="Support requests submitted by users will appear here."
          />
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Ticket status summary */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <LayoutDashboard size={21} />
              </div>

              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  Ticket Health
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Overall support progress
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Completed Tickets
                </p>

                <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                  {completedTickets}
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-700">
                {completionPercentage}% complete
              </span>
            </div>

            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Ticket completion percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercentage}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>

            <div className="mt-6 space-y-4 border-t border-border-soft pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                  <span className="text-xs font-semibold text-slate-600">
                    Active Tickets
                  </span>
                </div>

                <span className="text-sm font-extrabold text-slate-900">
                  {activeTickets}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Assigned
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {assignedTickets}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Resolved
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {resolvedTickets}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Closed
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {closedTickets}
                </span>
              </div>
            </div>
          </div>

          {/* Management shortcuts */}
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border-soft px-5 py-5">
              <h2 className="font-display text-base font-extrabold text-slate-900">
                Quick Management
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Admin tools and operations
              </p>
            </div>

            <div className="space-y-1 p-3">
              <ManagementLink
                to="/admin/tickets"
                icon={Ticket}
                title="Manage Tickets"
                description="Review, assign, and prioritize tickets"
                color="brand"
              />

              <ManagementLink
                to="/admin/agents"
                icon={UserCog}
                title="Manage Agents"
                description="Create and manage support agents"
                color="blue"
              />

              <ManagementLink
                to="/admin/categories"
                icon={FolderKanban}
                title="Manage Categories"
                description="Organize ticket categories"
                color="purple"
              />
            </div>
          </div>

          {/* Admin information */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-6 text-white shadow-lg shadow-brand-600/10">
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"
            />

            <div className="relative">
              <Users size={26} />

              <h3 className="mt-4 font-display text-lg font-extrabold">
                Keep Support Moving
              </h3>

              <p className="mt-2 text-xs leading-6 text-indigo-100">
                Review incoming tickets, assign them to available
                agents, and monitor resolution progress across
                your support team.
              </p>

              <Link
                to="/admin/tickets"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-brand-700 transition-colors hover:bg-indigo-50"
              >
                Review Tickets
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
