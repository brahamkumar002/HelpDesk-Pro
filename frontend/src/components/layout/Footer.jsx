
import { Link } from 'react-router-dom';

import {
  ArrowUpRight,
  Headphones,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const ROLE_DETAILS = {
  USER: {
    label: 'Customer Portal',
    dashboardPath: '/user/dashboard',
  },
  AGENT: {
    label: 'Agent Workspace',
    dashboardPath: '/agent/dashboard',
  },
  ADMIN: {
    label: 'Admin Console',
    dashboardPath: '/admin/dashboard',
  },
};

export default function Footer({ className = '' }) {
  const { user } = useAuth();

  const currentYear = new Date().getFullYear();

  const roleDetails =
    ROLE_DETAILS[user?.role] || ROLE_DETAILS.USER;

  return (
    <footer
      className={[
        'border-t border-border-soft bg-white/80',
        className,
      ].join(' ')}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Branding */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Headphones size={20} strokeWidth={2.1} />
            </div>

            <div>
              <p className="font-display text-sm font-extrabold tracking-tight text-slate-900">
                HelpDesk
                <span className="text-brand-600"> Pro</span>
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                A smarter way to manage support requests.
              </p>
            </div>
          </div>

          {/* Footer information */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck
                size={15}
                className="text-emerald-600"
                aria-hidden="true"
              />

              <span>Role-based access</span>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <HeartHandshake
                size={15}
                className="text-brand-600"
                aria-hidden="true"
              />

              <span>{roleDetails.label}</span>
            </div>

            <Link
              to={roleDetails.dashboardPath}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <LayoutDashboard size={15} />

              Dashboard

              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-5 flex flex-col gap-2 border-t border-border-soft pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} HelpDesk Pro. All rights reserved.
          </p>

          <p>
            Built for organized, efficient support management.
          </p>
        </div>
      </div>
    </footer>
  );
}
