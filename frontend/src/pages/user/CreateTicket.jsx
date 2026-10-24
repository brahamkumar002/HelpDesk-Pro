
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Layers3,
  LifeBuoy,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  TicketPlus,
} from 'lucide-react';

import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';

const INITIAL_FORM = {
  title: '',
  description: '',
  categoryId: '',
  priority: 'MEDIUM',
};

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low — General question or minor issue' },
  { value: 'MEDIUM', label: 'Medium — Normal support request' },
  { value: 'HIGH', label: 'High — Significant impact on work' },
  { value: 'URGENT', label: 'Urgent — Critical issue requiring attention' },
];

const PRIORITY_DETAILS = {
  LOW: {
    label: 'Low priority',
    description: 'Minor issue or general assistance.',
    dot: 'bg-emerald-500',
    background: 'border-emerald-200 bg-emerald-50',
    text: 'text-emerald-800',
  },
  MEDIUM: {
    label: 'Medium priority',
    description: 'Standard issue affecting normal work.',
    dot: 'bg-blue-500',
    background: 'border-blue-200 bg-blue-50',
    text: 'text-blue-800',
  },
  HIGH: {
    label: 'High priority',
    description: 'Important issue with significant impact.',
    dot: 'bg-orange-500',
    background: 'border-orange-200 bg-orange-50',
    text: 'text-orange-800',
  },
  URGENT: {
    label: 'Urgent priority',
    description: 'Critical issue requiring immediate attention.',
    dot: 'bg-rose-500',
    background: 'border-rose-200 bg-rose-50',
    text: 'text-rose-800',
  },
};

function validateForm(form, categories) {
  const errors = {};

  const title = form.title.trim();
  const description = form.description.trim();

  if (!title) {
    errors.title = 'Please enter a ticket title.';
  }

  if (!description) {
    errors.description = 'Please describe your issue.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Please select a category.';
  } else if (
    !categories.some(
      (category) => String(category.id) === String(form.categoryId)
    )
  ) {
    errors.categoryId = 'Please select a valid category.';
  }

  if (!PRIORITY_DETAILS[form.priority]) {
    errors.priority = 'Please select a valid priority.';
  }

  return errors;
}

export default function CreateTicket() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setIsLoadingCategories(true);
      setCategoryError('');

      try {
        const response = await api.get('/categories');

        if (!active) return;

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.content)
            ? response.content
            : [];

        setCategories(categoryList);
      } catch (error) {
        if (!active) return;

        setCategoryError(
          error?.message ||
            'Unable to load ticket categories. Please try again.'
        );
      } finally {
        if (active) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => {
      if (!previous[name]) return previous;

      const next = { ...previous };
      delete next[name];

      return next;
    });

    if (submitError) {
      setSubmitError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || isLoadingCategories || categoryError) {
      return;
    }

    const validationErrors = validateForm(form, categories);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const createdTicket = await api.post('/tickets', {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        priority: form.priority,
      });

      toast.success('Your support ticket was created successfully.');

      if (createdTicket?.id !== undefined && createdTicket?.id !== null) {
        navigate(`/user/tickets/${createdTicket.id}`, {
          replace: true,
        });
      } else {
        navigate('/user/tickets', {
          replace: true,
        });
      }
    } catch (error) {
      const message =
        error?.message ||
        'Unable to create your ticket. Please try again.';

      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedPriority =
    PRIORITY_DETAILS[form.priority] ?? PRIORITY_DETAILS.MEDIUM;

  const categoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const canSubmit =
    !isSubmitting &&
    !isLoadingCategories &&
    !categoryError &&
    categories.length > 0;

  return (
    <div className="page-container space-y-7 py-7 sm:py-9">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/user/tickets"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft size={15} />
          Back to My Tickets
        </Link>
      </nav>

      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <TicketPlus size={16} />
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Support Request
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Create a New Ticket
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Tell us what's happening. Provide enough details so
            the support team can understand and resolve your issue.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
          <ShieldCheck size={16} />
          Secure support request
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main form */}
        <section className="surface-card overflow-hidden">
          <div className="border-b border-border-soft px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FileText size={21} />
              </div>

              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  Ticket Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Fields marked with * are required
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 p-5 sm:p-7"
          >
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-rose-600"
                />

                <p className="text-sm leading-6 text-rose-700">
                  {submitError}
                </p>
              </div>
            )}

            <Input
              label="Ticket Title"
              name="title"
              value={form.title}
              onChange={(event) =>
                updateField('title', event.target.value)
              }
              placeholder="Briefly describe the issue"
              error={errors.title}
              hint="Use a short, specific title for your request."
              required
              disabled={isSubmitting}
            />

            <Textarea
              label="Issue Description"
              name="description"
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Explain what happened, what you expected, and any steps you've already tried..."
              error={errors.description}
              hint="Include relevant details to help the support team investigate."
              rows={7}
              resize="vertical"
              required
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Select
                  label="Category"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField('categoryId', event.target.value)
                  }
                  options={categoryOptions}
                  placeholder={
                    isLoadingCategories
                      ? 'Loading categories...'
                      : 'Select a category'
                  }
                  error={errors.categoryId}
                  hint="Choose the category that best matches your issue."
                  required
                  disabled={
                    isSubmitting ||
                    isLoadingCategories ||
                    Boolean(categoryError) ||
                    categories.length === 0
                  }
                />

                {isLoadingCategories && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <LoaderCircle
                      size={14}
                      className="animate-spin"
                    />
                    Loading available categories...
                  </div>
                )}

                {categoryError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700"
                  >
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                    {categoryError}
                  </div>
                )}

                {!isLoadingCategories &&
                  !categoryError &&
                  categories.length === 0 && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700">
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0"
                      />
                      No active categories are available right now.
                      Please contact an administrator.
                    </div>
                  )}
              </div>

              <Select
                label="Priority"
                name="priority"
                value={form.priority}
                onChange={(event) =>
                  updateField('priority', event.target.value)
                }
                options={PRIORITY_OPTIONS}
                error={errors.priority}
                hint="Select the impact level of your issue."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Priority guidance */}
            <div
              className={[
                'flex items-start gap-3 rounded-xl border p-4',
                selectedPriority.background,
              ].join(' ')}
            >
              <span
                className={[
                  'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                  selectedPriority.dot,
                ].join(' ')}
              />

              <div>
                <p
                  className={[
                    'text-xs font-extrabold',
                    selectedPriority.text,
                  ].join(' ')}
                >
                  {selectedPriority.label}
                </p>

                <p
                  className={[
                    'mt-1 text-xs leading-5 opacity-80',
                    selectedPriority.text,
                  ].join(' ')}
                >
                  {selectedPriority.description}
                </p>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-border-soft pt-6 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/user/tickets')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                leftIcon={TicketPlus}
                loading={isSubmitting}
                disabled={!canSubmit}
              >
                {isSubmitting ? 'Creating Ticket...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="surface-card p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={21} />
            </div>

            <h2 className="mt-4 font-display text-base font-extrabold text-slate-900">
              Tips for a Better Ticket
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              A clear request helps the team understand your issue.
            </p>

            <div className="mt-5 space-y-4">
              {[
                {
                  title: 'Be specific',
                  description:
                    'Describe exactly what is not working.',
                },
                {
                  title: 'Share the context',
                  description:
                    'Mention when the issue started and what you were doing.',
                },
                {
                  title: 'Include troubleshooting',
                  description:
                    'Tell us what you have already tried.',
                },
              ].map((tip, index) => (
                <div
                  key={tip.title}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={15} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {index + 1}. {tip.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-5 text-white">
            <div
              aria-hidden="true"
              className="absolute -right-7 -top-7 h-28 w-28 rounded-full bg-white/10"
            />

            <div className="relative">
              <LifeBuoy size={26} />

              <h3 className="mt-4 font-display text-base font-extrabold">
                Track Your Request
              </h3>

              <p className="mt-2 text-xs leading-6 text-indigo-100">
                After submitting, you can follow the ticket's
                status and communicate with the support team.
              </p>

              <Link
                to="/user/tickets"
                className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-white transition-opacity hover:opacity-80"
              >
                View My Tickets
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <Layers3
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-5 text-blue-800">
              Your ticket will initially have an{' '}
              <strong>OPEN</strong> status. An administrator
              can then assign it to a support agent.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
