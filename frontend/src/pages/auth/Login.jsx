
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Headphones,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TicketCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ROLE_HOME_PATHS = {
  USER: '/user/dashboard',
  AGENT: '/agent/dashboard',
  ADMIN: '/admin/dashboard',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, login, isInitializing } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath =
    typeof location.state?.from?.pathname === 'string'
      ? location.state.from.pathname
      : null;

  if (isInitializing) {
    return (
      <div
        role="status"
        aria-label="Checking your session"
        className="flex min-h-screen items-center justify-center bg-app"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to={ROLE_HOME_PATHS[user.role] ?? '/'}
        replace
      />
    );
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
      general: '',
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const authenticatedUser = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const authenticatedRole = authenticatedUser?.role;

      const homePath =
        ROLE_HOME_PATHS[authenticatedRole] ?? '/';

      toast.success('Welcome back! You are now signed in.');

      navigate(
        redirectPath &&
          redirectPath !== '/login' &&
          redirectPath !== '/register'
          ? redirectPath
          : homePath,
        { replace: true }
      );
    } catch (error) {
      const message =
        error?.message ||
        'Unable to sign in. Please try again.';

      setErrors((previous) => ({
        ...previous,
        general: message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex xl:px-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-40 h-[480px] w-[480px] rounded-full bg-brand-600/25 blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 -left-28 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[110px]"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/25">
            <CircleHelp size={25} strokeWidth={2.2} />
          </div>

          <div>
            <p className="font-display text-xl font-extrabold tracking-tight">
              HelpDesk <span className="text-indigo-300">Pro</span>
            </p>

            <p className="text-xs text-slate-400">
              Support management platform
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg py-16">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-indigo-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            One workspace. Better support.
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-[1.16] tracking-tight xl:text-5xl">
            Support that
            <br />
            <span className="text-indigo-300">
              moves things forward.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
            Manage support requests, collaborate with agents,
            and stay on top of every ticket — all from one
            organized workspace.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <TicketCheck
                  size={21}
                  className="text-indigo-300"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  Organized ticket management
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Create, assign, prioritize, and track support
                  requests with clarity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <Headphones
                  size={21}
                  className="text-indigo-300"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  Built for every role
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Dedicated workspaces for users, support
                  agents, and administrators.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <ShieldCheck
                  size={21}
                  className="text-indigo-300"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  Secure role-based access
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Access the right information and actions
                  based on your account role.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HelpDesk Pro
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2
              size={15}
              className="text-emerald-400"
            />
            Built for better support
          </div>
        </div>
      </section>

      {/* Right login panel */}
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <CircleHelp size={21} />
            </div>

            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
              HelpDesk <span className="text-brand-600">Pro</span>
            </span>
          </div>

          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            New here?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 transition-colors hover:text-brand-700"
            >
              Create account
            </Link>
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px] animate-enter">
            <div className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50">
                <LockKeyhole
                  size={25}
                  strokeWidth={1.8}
                  className="text-brand-600"
                />
              </div>

              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to your account to access your
                HelpDesk Pro workspace.
              </p>
            </div>

            {errors.general && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
              >
                {errors.general}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                error={errors.email}
                leftIcon={Mail}
                required
                disabled={isSubmitting}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={updateField}
                error={errors.password}
                leftIcon={LockKeyhole}
                required
                disabled={isSubmitting}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  rightIcon={ArrowRight}
                >
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium text-slate-400">
                Secure account access
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck
                size={16}
                className="text-emerald-600"
              />

              Your workspace is protected by secure
              session authentication.
            </div>
          </div>
        </div>

        <footer className="px-6 pb-8 text-center text-xs text-slate-400 sm:px-10">
          © {new Date().getFullYear()} HelpDesk Pro.
          All rights reserved.
        </footer>
      </main>
    </div>
  );
}
