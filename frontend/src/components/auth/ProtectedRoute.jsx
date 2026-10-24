
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const ROLE_HOME_PATHS = {
  USER: '/user/dashboard',
  AGENT: '/agent/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-app px-6"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-white shadow-soft">
            <LoaderCircle
              size={26}
              strokeWidth={2}
              className="animate-spin text-brand-600"
            />
          </div>

          <div className="text-center">
            <p className="font-display text-sm font-bold text-slate-900">
              HelpDesk Pro
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Preparing your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={ROLE_HOME_PATHS[user.role] ?? '/login'}
        replace
      />
    );
  }

  return <Outlet />;
}
