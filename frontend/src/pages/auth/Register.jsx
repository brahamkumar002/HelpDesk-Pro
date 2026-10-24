
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Headphones,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TicketCheck,
  UserRound,
  Users,
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

export default function Register() {
  const navigate = useNavigate();

  const { user, register, isInitializing } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!fullName) {
      nextErrors.fullName = 'Full name is required.';
    } else if (fullName.length < 2) {
      nextErrors.fullName =
        'Full name must contain at least 2 characters.';
    } else if (fullName.length > 100) {
      nextErrors.fullName =
        'Full name cannot exceed 100 characters.';
    }

    if (!email) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password =
        'Password must contain at least 8 characters.';
    } else if (form.password.length > 100) {
      nextErrors.password =
        'Password cannot exceed 100 characters.';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        'Please confirm your password.';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword =
        'Passwords do not match.';
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
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success(
        'Account created successfully! Please sign in.'
      );

      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: form.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        general:
          error?.message ||
          'Unable to create your account. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

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
            Your support journey starts here
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-[1.16] tracking-tight xl:text-5xl">
            A better way
            <br />
            <span className="text-indigo-300">
              to get things resolved.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
            Create your account to submit support requests,
            track ticket progress, and communicate with your
            support team in one place.
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
                  Submit support tickets
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Describe your issue, choose a category,
                  and set the appropriate priority.
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
                  Stay connected with support
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Follow updates and communicate through
                  ticket comments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <Users
                  size={21}
                  className="text-indigo-300"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  One organized workspace
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Keep every support request and its
                  progress easy to find.
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

      {/* Right registration panel */}
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
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-600 transition-colors hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px] animate-enter">
            <div className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50">
                <UserRound
                  size={25}
                  strokeWidth={1.8}
                  className="text-brand-600"
                />
              </div>

              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Join HelpDesk Pro and manage your support
                requests with ease.
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
                label="Full name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={updateField}
                error={errors.fullName}
                leftIcon={UserRound}
                maxLength={100}
                required
                disabled={isSubmitting}
              />

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
                autoComplete="new-password"
                placeholder="Create a secure password"
                value={form.password}
                onChange={updateField}
                error={errors.password}
                leftIcon={LockKeyhole}
                required
                disabled={isSubmitting}
              />

              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={updateField}
                error={errors.confirmPassword}
                leftIcon={LockKeyhole}
                required
                disabled={isSubmitting}
              />

              <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Your account will be created with the
                  <span className="font-semibold text-slate-700">
                    {' '}User
                  </span>
                  {' '}role. Support agent accounts are managed
                  by administrators.
                </p>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  rightIcon={ArrowRight}
                >
                  Create account
                </Button>
              </div>
            </form>

            <p className="mt-7 text-center text-xs leading-6 text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-600 hover:text-brand-700"
              >
                Sign in instead
              </Link>
            </p>
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
