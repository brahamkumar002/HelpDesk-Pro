
import { Link, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Headphones,
  Home,
  SearchX,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import Button from '../components/ui/Button';

const ROLE_HOME_PATHS = {
  USER: '/user/dashboard',
  AGENT: '/agent/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAuthenticated = Boolean(user);

  const homePath = isAuthenticated
    ? ROLE_HOME_PATHS[user.role] || '/'
    : '/login';

  const homeLabel = isAuthenticated
    ? 'Go to Dashboard'
    : 'Go to Login';

  function handleGoBack() {
    // For a directly opened invalid URL, a browser history entry
    // may not exist. In that case, use the safe application route.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(homePath, { replace: true });
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] flex-col overflow-hidden bg-app">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-28 top-12 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />

        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-50 blur-3xl" />
      </div>

      {/* Content */}
      <main className="page-container relative z-10 flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-20">
        {/* Brand */}
        <Link
          to={homePath}
          className="group inline-flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="HelpDesk Pro home"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg shadow-brand-600/20">
            <Headphones size={23} />
          </div>

          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            HelpDesk
            <span className="text-brand-600"> Pro</span>
          </span>
        </Link>

        {/* Illustration */}
        <div className="relative mt-12 sm:mt-14">
          <div className="absolute inset-0 scale-125 rounded-full bg-brand-100/60 blur-3xl" />

          <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-brand-100 bg-white shadow-xl shadow-brand-900/10 sm:h-36 sm:w-36">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-brand-50 sm:h-28 sm:w-28">
              <SearchX
                size={54}
                strokeWidth={1.5}
                className="text-brand-600 sm:h-16 sm:w-16"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="absolute -right-5 -top-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-amber-50 text-amber-600 shadow-md">
            <Compass size={21} aria-hidden="true" />
          </div>
        </div>

        {/* Error code */}
        <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.25em] text-brand-600">
          Error 404
        </p>

        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Page not found
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist
          or may have been moved. Check the URL or head back
          to your workspace.
        </p>

        {/* Actions */}
        <div className="mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="lg"
            leftIcon={ArrowLeft}
            onClick={handleGoBack}
          >
            Go Back
          </Button>

          <Link
            to={homePath}
            className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <Home size={18} aria-hidden="true" />

            {homeLabel}

            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-border-soft pt-6 text-xs font-medium text-slate-400">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck
              size={15}
              className="text-emerald-600"
              aria-hidden="true"
            />
            Secure Support Platform
          </span>

          <span className="inline-flex items-center gap-2">
            <Headphones
              size={15}
              className="text-brand-600"
              aria-hidden="true"
            />
            HelpDesk Pro
          </span>
        </div>
      </main>
    </div>
  );
}
