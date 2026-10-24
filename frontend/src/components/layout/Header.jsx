
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  ChevronDown,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLE_HOME_PATHS = {
  USER: '/user/dashboard',
  AGENT: '/agent/dashboard',
  ADMIN: '/admin/dashboard',
};

const PAGE_DETAILS = [
  {
    pattern: /^\/user\/dashboard\/?$/,
    title: 'Dashboard',
    section: 'Overview',
  },
  {
    pattern: /^\/user\/tickets\/new\/?$/,
    title: 'Create Ticket',
    section: 'My Workspace',
  },
  {
    pattern: /^\/user\/tickets\/?$/,
    title: 'My Tickets',
    section: 'My Workspace',
  },
  {
    pattern: /^\/user\/tickets\/[^/]+\/?$/,
    title: 'Ticket Details',
    section: 'My Workspace',
  },
  {
    pattern: /^\/agent\/dashboard\/?$/,
    title: 'Agent Dashboard',
    section: 'Workspace',
  },
  {
    pattern: /^\/agent\/tickets\/?$/,
    title: 'Assigned Tickets',
    section: 'Workspace',
  },
  {
    pattern: /^\/agent\/tickets\/[^/]+\/?$/,
    title: 'Ticket Details',
    section: 'Workspace',
  },
  {
    pattern: /^\/admin\/dashboard\/?$/,
    title: 'Admin Dashboard',
    section: 'Overview',
  },
  {
    pattern: /^\/admin\/tickets\/?$/,
    title: 'All Tickets',
    section: 'Ticket Management',
  },
  {
    pattern: /^\/admin\/tickets\/[^/]+\/?$/,
    title: 'Ticket Details',
    section: 'Ticket Management',
  },
  {
    pattern: /^\/admin\/agents\/?$/,
    title: 'Manage Agents',
    section: 'Management',
  },
  {
    pattern: /^\/admin\/categories\/?$/,
    title: 'Manage Categories',
    section: 'Management',
  },
];

function getPageDetails(pathname) {
  return (
    PAGE_DETAILS.find((page) => page.pattern.test(pathname)) || {
      title: 'HelpDesk Pro',
      section: 'Workspace',
    }
  );
}

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return '?';
  }

  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

function getRoleLabel(role) {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'AGENT':
      return 'Support Agent';
    case 'USER':
      return 'Customer';
    default:
      return 'Account';
  }
}

export default function Header({
  onMenuClick,
  className = '',
}) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const page = getPageDetails(location.pathname);
  const dashboardPath = ROLE_HOME_PATHS[user?.role] || '/';

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setIsProfileOpen(false);

    try {
      await logout();

      navigate('/login', {
        replace: true,
      });

      toast.success('You have been logged out successfully.');
    } catch (error) {
      toast.error(
        error?.message || 'Unable to log out. Please try again.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header
      className={[
        'sticky top-0 z-30 flex h-[76px] shrink-0 items-center',
        'border-b border-border-soft bg-white/95 px-4 backdrop-blur-xl',
        'sm:px-6 lg:px-8',
        className,
      ].join(' ')}
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-4">
        {/* Left: mobile menu and page title */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <div className="hidden items-center gap-2 text-[11px] font-semibold text-slate-400 sm:flex">
              <span>{page.section}</span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="truncate text-brand-600">
                {page.title}
              </span>
            </div>

            <h2 className="truncate font-display text-base font-extrabold tracking-tight text-slate-900 sm:mt-1 sm:text-lg">
              {page.title}
            </h2>
          </div>
        </div>

        {/* Right: workspace and account */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            to={dashboardPath}
            className="hidden h-10 items-center gap-2 rounded-xl border border-border-soft px-3.5 text-xs font-bold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 md:inline-flex"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <div className="hidden h-8 w-px bg-border-soft md:block" />

          {/* Account dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsProfileOpen((previous) => !previous)
              }
              disabled={isLoggingOut}
              aria-label="Account menu"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              className="flex min-h-11 items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700 ring-2 ring-white">
                {getInitials(user?.fullName)}
              </div>

              <div className="hidden min-w-0 max-w-40 text-left sm:block">
                <p className="truncate text-xs font-extrabold text-slate-900">
                  {user?.fullName || 'Account'}
                </p>

                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                  {getRoleLabel(user?.role)}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={[
                  'hidden text-slate-400 transition-transform sm:block',
                  isProfileOpen ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {isProfileOpen && (
              <>
                {/* Click-outside layer */}
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close account menu"
                  onClick={() => setIsProfileOpen(false)}
                />

                <div
                  role="menu"
                  aria-label="Account options"
                  className="absolute right-0 top-full z-50 mt-3 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border-soft bg-white p-2 shadow-xl shadow-slate-900/10"
                >
                  <div className="border-b border-border-soft px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <UserRound size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                          {user?.fullName || 'Account'}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-bold text-brand-700">
                      <ShieldCheck size={13} />
                      {getRoleLabel(user?.role)}
                    </div>
                  </div>

                  <Link
                    to={dashboardPath}
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                    className="mt-2 flex min-h-10 items-center gap-3 rounded-xl px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-600"
                  >
                    <LayoutDashboard size={17} />
                    Go to Dashboard
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={17} />

                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
