
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Headphones,
  Plus,
  RefreshCw,
  Ticket,
  TrendingUp,
} from 'lucide-react';

import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import Button from '../../components/ui/Button';
import StatCard from '../../components/dashboard/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const RECENT_TICKETS_LIMIT = 5;

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [dashboard, setDashboard] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async (signal) => {
    const [dashboardData, ticketsPage] = await Promise.all([
      api.get('/dashboard', { signal }),
      api.get(
        `/tickets/my?page=0&size=${RECENT_TICKETS_LIMIT}`,
        { signal }
      ),
    ]);

    return {
      dashboardData,
      tickets: Array.isArray(ticketsPage?.content)
        ? ticketsPage.content
        : [],
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const result = await fetchDashboard(controller.signal);

        if (controller.signal.aborted) return;

        setDashboard(result.dashboardData);
        setRecentTickets(result.tickets);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err?.message ||
            'Unable to load your dashboard. Please try again.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [fetchDashboard]);

  async function handleRefresh() {
    if (isRefreshing || isLoading) return;

    setIsRefreshing(true);
    setError('');

    try {
      const result = await fetchDashboard();

      setDashboard(result.dashboardData);
      setRecentTickets(result.tickets);

      toast.success('Dashboard updated successfully.');
    } catch (err) {
      const message =
        err?.message || 'Unable to refresh dashboard.';

      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  const firstName =
    user?.fullName?.trim().split(/\s+/)[0] || 'there';

  const totalTickets = dashboard?.totalTickets ?? 0;
  const openTickets = dashboard?.openTickets ?? 0;
  const assignedTickets = dashboard?.assignedTickets ?? 0;
  const inProgressTickets = dashboard?.inProgressTickets ?? 0;
  const resolvedTickets = dashboard?.resolvedTickets ?? 0;
  const closedTickets = dashboard?.closedTickets ?? 0;

  const activeTickets =
    openTickets + assignedTickets + inProgressTickets;

  if (isLoading) {
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
            <CircleHelp size={26} />
          </div>

          <h2 className="mt-5 font-display text-xl font-extrabold text-slate-900">
            Couldn't load your dashboard
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
      {/* Welcome section */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Your support workspace
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {firstName}
            <span className="ml-2">👋</span>
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Here's an overview of your support requests and
            their progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            leftIcon={RefreshCw}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            leftIcon={Plus}
            onClick={() => navigate('/user/tickets/new')}
          >
            New Ticket
          </Button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <section aria-label="Ticket statistics">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-extrabold text-slate-900">
              Ticket Overview
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your support activity at a glance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={Ticket}
            variant="brand"
            description="All your requests"
            onClick={() => navigate('/user/tickets')}
          />

          <StatCard
            title="Open Tickets"
            value={openTickets}
            icon={Clock3}
            variant="amber"
            description="Awaiting assignment"
            onClick={() => navigate('/user/tickets')}
          />

          <StatCard
            title="In Progress"
            value={inProgressTickets}
            icon={TrendingUp}
            variant="blue"
            description="Being worked on"
            onClick={() => navigate('/user/tickets')}
          />

          <StatCard
            title="Resolved"
            value={resolvedTickets}
            icon={CheckCircle2}
            variant="green"
            description="Issues resolved"
            onClick={() => navigate('/user/tickets')}
          />
        </div>
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="min-w-0 xl:col-span-2">
          <TicketTable
            tickets={recentTickets}
            role="USER"
            title="Recent Tickets"
            description="Your latest support requests"
            headerAction={
              <Link
                to="/user/tickets"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 transition-colors hover:text-brand-700"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            }
            emptyTitle="No support tickets yet"
            emptyDescription="Create your first ticket and our support team can start helping you."
            emptyActionLabel="Create Ticket"
            onEmptyAction={() => navigate('/user/tickets/new')}
          />
        </section>

        <aside className="space-y-6">
          {/* Quick actions */}
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border-soft px-5 py-5">
              <h2 className="font-display text-base font-extrabold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Get things done faster
              </p>
            </div>

            <div className="space-y-2 p-3">
              <Link
                to="/user/tickets/new"
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-brand-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Plus size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Create a Ticket
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Submit a new support request
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </Link>

              <Link
                to="/user/tickets"
                className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Ticket size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    My Tickets
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Check your ticket progress
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </Link>
            </div>
          </div>

          {/* Status summary */}
          <div className="surface-card p-5">
            <h2 className="font-display text-base font-extrabold text-slate-900">
              Request Summary
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Current ticket status breakdown
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">
                    Active Requests
                  </span>
                </div>

                <span className="font-display text-lg font-extrabold text-slate-900">
                  {activeTickets}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${
                      totalTickets > 0
                        ? Math.min(
                            100,
                            (activeTickets / totalTickets) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="subtle-divider" />

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

          {/* Help card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-6 text-white shadow-lg shadow-brand-600/10">
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"
            />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Headphones size={22} />
              </div>

              <h3 className="mt-4 font-display text-lg font-extrabold">
                Need help with something?
              </h3>

              <p className="mt-2 text-xs leading-6 text-indigo-100">
                Describe your issue in a support ticket so
                our team can review and resolve it.
              </p>

              <Link
                to="/user/tickets/new"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-brand-700 transition-colors hover:bg-indigo-50"
              >
                Get Support
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
