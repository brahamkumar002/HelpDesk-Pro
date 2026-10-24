
import { NavLink } from 'react-router-dom';

import {
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FolderKanban,
  Headphones,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Ticket,
  UserCog,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const NAVIGATION = {
  USER: [
    {
      label: 'Overview',
      items: [
        {
          label: 'Dashboard',
          to: '/user/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'My Tickets',
          to: '/user/tickets',
          icon: Ticket,
          end: true,
        },
        {
          label: 'Create Ticket',
          to: '/user/tickets/new',
          icon: PlusCircle,
        },
      ],
    },
  ],

  AGENT: [
    {
      label: 'Workspace',
      items: [
        {
          label: 'Dashboard',
          to: '/agent/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'Assigned Tickets',
          to: '/agent/tickets',
          icon: ClipboardList,
          end: true,
        },
      ],
    },
  ],

  ADMIN: [
    {
      label: 'Overview',
      items: [
        {
          label: 'Dashboard',
          to: '/admin/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'All Tickets',
          to: '/admin/tickets',
          icon: Ticket,
          end: true,
        },
      ],
    },
    {
      label: 'Management',
      items: [
        {
          label: 'Manage Agents',
          to: '/admin/agents',
          icon: UserCog,
        },
        {
          label: 'Manage Categories',
          to: '/admin/categories',
          icon: FolderKanban,
        },
      ],
    },
  ],
};

const ROLE_DETAILS = {
  USER: {
    label: 'Customer Portal',
    description: 'Your support workspace',
    icon: CircleHelp,
  },
  AGENT: {
    label: 'Agent Workspace',
    description: 'Resolve support requests',
    icon: Headphones,
  },
  ADMIN: {
    label: 'Admin Console',
    description: 'Manage your helpdesk',
    icon: ShieldCheck,
  },
};

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return '?';
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function SidebarNavItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3',
          'text-sm font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          isActive
            ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={19}
            strokeWidth={isActive ? 2.3 : 1.9}
            className={
              isActive
                ? 'shrink-0 text-brand-600'
                : 'shrink-0 text-slate-400 transition-colors group-hover:text-slate-700'
            }
            aria-hidden="true"
          />

          <span className="min-w-0 flex-1 truncate">
            {item.label}
          </span>

          {isActive && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
          )}

          {!isActive && (
            <ChevronRight
              size={15}
              className="shrink-0 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({
  onNavigate,
  onClose,
  showCloseButton = false,
  className = '',
}) {
  const { user } = useAuth();

  const role = user?.role || 'USER';
  const sections = NAVIGATION[role] || [];

  const roleDetails = ROLE_DETAILS[role] || ROLE_DETAILS.USER;
  const RoleIcon = roleDetails.icon;

  const dashboardPath =
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'AGENT'
        ? '/agent/dashboard'
        : '/user/dashboard';

  return (
    <aside
      aria-label="Main navigation"
      className={[
        'flex h-full min-h-0 w-full flex-col bg-white',
        className,
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-border-soft px-5">
        <NavLink
          to={dashboardPath}
          onClick={onNavigate}
          className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="HelpDesk Pro Dashboard"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg shadow-brand-600/20">
            <Headphones size={23} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-display text-base font-extrabold tracking-tight text-slate-900">
              HelpDesk
              <span className="text-brand-600"> Pro</span>
            </p>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Support Platform
            </p>
          </div>
        </NavLink>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Role workspace */}
      <div className="shrink-0 px-4 pt-5">
        <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
            <RoleIcon size={19} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-slate-900">
              {roleDetails.label}
            </p>

            <p className="mt-1 truncate text-[11px] text-slate-500">
              {roleDetails.description}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav
        aria-label="Workspace navigation"
        className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-7"
      >
        {sections.map((section) => (
          <div key={section.label}>
            <h2 className="mb-3 px-3.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
              {section.label}
            </h2>

            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-soft p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-900">
                Secure Workspace
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Your support activity is protected
                with role-based access.
              </p>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="mt-4 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700">
            {getInitials(user?.fullName)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-extrabold text-slate-900">
              {user?.fullName || 'Account'}
            </p>

            <p className="mt-1 truncate text-[11px] text-slate-500">
              {user?.email || formatRole(role)}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function formatRole(role) {
  return role
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
