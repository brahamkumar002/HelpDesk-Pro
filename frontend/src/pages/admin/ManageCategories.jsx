
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FolderKanban,
  FolderPlus,
  Pencil,
  Plus,
  RefreshCw,
  Tag,
  Tags,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const EMPTY_FORM = {
  name: '',
  description: '',
};

function normalizeCategories(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
}

function validateForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Category name is required.';
  }

  if (form.name.trim().length > 100) {
    errors.name = 'Category name must not exceed 100 characters.';
  }

  if (form.description.trim().length > 500) {
    errors.description =
      'Description must not exceed 500 characters.';
  }

  return errors;
}

function CategoryCard({
  category,
  onEdit,
  onToggle,
  disabled,
}) {
  const isEnabled = category.enabled === true;

  return (
    <article className="surface-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
            isEnabled
              ? 'bg-brand-50 text-brand-600'
              : 'bg-slate-100 text-slate-500',
          ].join(' ')}
        >
          <Tag size={22} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-extrabold text-slate-900">
              {category.name}
            </h3>

            <span
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
                'text-[11px] font-bold',
                isEnabled
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  isEnabled
                    ? 'bg-emerald-500'
                    : 'bg-slate-400',
                ].join(' ')}
              />

              {isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>

          <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words text-xs leading-6 text-slate-500">
            {category.description?.trim() ||
              'No description provided.'}
          </p>

          <p className="mt-2 text-[11px] font-medium text-slate-400">
            Category ID: #{category.id}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={Pencil}
          onClick={() => onEdit(category)}
          disabled={disabled}
        >
          Edit
        </Button>

        <Button
          variant={isEnabled ? 'danger-outline' : 'secondary'}
          size="sm"
          leftIcon={isEnabled ? ToggleLeft : ToggleRight}
          onClick={() => onToggle(category)}
          disabled={disabled}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </article>
  );
}

export default function ManageCategories() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const requestIdRef = useRef(0);

  const loadCategories = useCallback(
    async (showLoader = true) => {
      const requestId = ++requestIdRef.current;

      if (showLoader) {
        setIsLoading(true);
        setIsRefreshing(false);
      } else {
        setIsRefreshing(true);
      }

      setError('');

      try {
        const response = await api.get('/categories/all');

        if (requestId !== requestIdRef.current) {
          return;
        }

        setCategories(normalizeCategories(response));
        setHasLoaded(true);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(
          err?.message ||
            'Unable to load categories. Please try again.'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadCategories();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadCategories]);

  function openCreateModal() {
    setEditingCategory(null);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    setFormError('');
    setIsFormOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);

    setForm({
      name: category.name ?? '',
      description: category.description ?? '',
    });

    setFormErrors({});
    setFormError('');
    setIsFormOpen(true);
  }

  function closeFormModal() {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingCategory(null);
    setFormErrors({});
    setFormError('');
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });

    setFormError('');
  }

  async function handleSaveCategory(event) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const validationErrors = validateForm(form);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setFormError('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    try {
      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory.id}`,
          payload
        );
      } else {
        await api.post('/categories', payload);
      }

      setIsFormOpen(false);
      setEditingCategory(null);
      setForm({ ...EMPTY_FORM });

      toast.success(
        editingCategory
          ? 'Category updated successfully.'
          : 'Category created successfully.'
      );

      await loadCategories(false);
    } catch (err) {
      const message =
        err?.message ||
        'Unable to save category. Please try again.';

      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleCategory() {
    if (!selectedCategory || isToggling) {
      return;
    }

    const category = selectedCategory;
    const isEnabled = category.enabled === true;
    const action = isEnabled ? 'disable' : 'enable';

    setIsToggling(true);

    try {
      await api.patch(
        `/categories/${category.id}/${action}`
      );

      setSelectedCategory(null);

      toast.success(
        `Category ${
          isEnabled ? 'disabled' : 'enabled'
        } successfully.`
      );

      await loadCategories(false);
    } catch (err) {
      toast.error(
        err?.message ||
          `Unable to ${action} category. Please try again.`
      );
    } finally {
      setIsToggling(false);
    }
  }

  const enabledCount = categories.filter(
    (category) => category.enabled === true
  ).length;

  const disabledCount = categories.length - enabledCount;

  const hasInitialError = Boolean(error) && !hasLoaded;

  const isBusy = isSaving || isToggling;

  return (
    <div className="page-container space-y-7 py-7 sm:py-9">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </nav>

      {/* Page header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FolderKanban size={17} />
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Administrator Workspace
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Manage Categories
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Organize support requests with categories.
            Create, edit, enable, or disable categories
            without deleting existing ticket history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            leftIcon={RefreshCw}
            onClick={() => loadCategories(false)}
            loading={isRefreshing}
            disabled={isLoading || isRefreshing}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            leftIcon={FolderPlus}
            onClick={openCreateModal}
            disabled={isBusy}
          >
            Add Category
          </Button>
        </div>
      </header>

      {/* Statistics */}
      <section
        aria-label="Category statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: 'Total Categories',
            value: categories.length,
            icon: Tags,
            color: 'bg-brand-50 text-brand-600',
          },
          {
            label: 'Active Categories',
            value: enabledCount,
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Disabled Categories',
            value: disabledCount,
            icon: ToggleLeft,
            color: 'bg-slate-100 text-slate-600',
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="surface-card flex items-center gap-4 p-5"
            >
              <div
                className={[
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                  stat.color,
                ].join(' ')}
              >
                <Icon size={23} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  {isLoading && !hasLoaded
                    ? '—'
                    : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-600"
            />

            <p className="text-sm leading-6 text-rose-700">
              {error}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => loadCategories()}
            disabled={isLoading || isRefreshing}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Category list */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-base font-extrabold text-slate-900">
            Ticket Categories
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {isLoading && !hasLoaded
              ? 'Loading categories...'
              : `${categories.length} ${
                  categories.length === 1
                    ? 'category'
                    : 'categories'
                } registered`}
          </p>
        </div>

        {isLoading && !hasLoaded ? (
          <div
            className="space-y-3"
            role="status"
            aria-label="Loading categories"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="surface-card flex items-center gap-4 p-5"
              >
                <div className="skeleton h-12 w-12 rounded-2xl" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton h-3 w-56 max-w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 && !hasInitialError ? (
          <div className="surface-card px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <FolderKanban size={29} />
            </div>

            <h3 className="mt-5 font-display text-lg font-extrabold text-slate-900">
              No categories created yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create a category so users can select it
              when submitting support tickets.
            </p>

            <div className="mt-6">
              <Button
                variant="primary"
                leftIcon={Plus}
                onClick={openCreateModal}
              >
                Create First Category
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={openEditModal}
                onToggle={setSelectedCategory}
                disabled={isBusy}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        title={
          editingCategory
            ? 'Edit Category'
            : 'Create Category'
        }
        description={
          editingCategory
            ? 'Update the category details.'
            : 'Add a new category for support tickets.'
        }
        size="md"
      >
        <form
          onSubmit={handleSaveCategory}
          noValidate
          className="space-y-5"
        >
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-rose-600"
              />

              <p className="text-xs leading-5 text-rose-700">
                {formError}
              </p>
            </div>
          )}

          <Input
            label="Category Name"
            name="name"
            value={form.name}
            onChange={(event) =>
              updateField('name', event.target.value)
            }
            placeholder="Enter category name"
            maxLength={100}
            error={formErrors.name}
            required
            disabled={isSaving}
          />

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
            placeholder="Describe the type of support requests covered by this category"
            rows={4}
            maxLength={500}
            showCount
            error={formErrors.description}
            disabled={isSaving}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-border-soft pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeFormModal}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              leftIcon={editingCategory ? Pencil : FolderPlus}
              loading={isSaving}
            >
              {editingCategory
                ? 'Save Changes'
                : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enable / Disable Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(selectedCategory)}
        onClose={() => {
          if (!isToggling) {
            setSelectedCategory(null);
          }
        }}
        onConfirm={handleToggleCategory}
        title={
          selectedCategory?.enabled
            ? 'Disable Category?'
            : 'Enable Category?'
        }
        description={
          selectedCategory?.enabled
            ? `Disable "${selectedCategory.name}"? Users will no longer be able to select it for new tickets, but existing tickets will remain unchanged.`
            : `Enable "${selectedCategory?.name}"? Users will be able to select it when creating new tickets.`
        }
        confirmText={
          selectedCategory?.enabled
            ? 'Disable Category'
            : 'Enable Category'
        }
        variant={
          selectedCategory?.enabled ? 'danger' : 'default'
        }
        loading={isToggling}
      />
    </div>
  );
}
