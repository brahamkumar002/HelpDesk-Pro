
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';

import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  password: '',
};

function getInitials(name) {
  if (!name) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function validateAgentForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Please enter the agent name.';
  }

  const email = form.email.trim();

  if (!email) {
    errors.email = 'Please enter an email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Please enter a password.';
  } else if (form.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.';
  }

  return errors;
}

function AgentCard({ agent, onToggle, busy }) {
  const isEnabled = agent.enabled === true;

  return (
    <article className="surface-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
          {getInitials(agent.fullName)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-extrabold text-slate-900">
              {agent.fullName}
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
                  isEnabled ? 'bg-emerald-500' : 'bg-slate-400',
                ].join(' ')}
              />

              {isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Mail size={14} className="shrink-0" />

            <span className="break-all">{agent.email}</span>
          </div>

          <p className="mt-2 text-[11px] font-medium text-slate-400">
            Agent ID: #{agent.id}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          variant={isEnabled ? 'danger-outline' : 'outline'}
          size="sm"
          leftIcon={isEnabled ? UserX : UserCheck}
          onClick={() => onToggle(agent)}
          disabled={busy}
        >
          {isEnabled ? 'Disable Agent' : 'Enable Agent'}
        </Button>
      </div>
    </article>
  );
}

export default function ManageAgents() {
  const toast = useToast();

  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const requestIdRef = useRef(0);

  const loadAgents = useCallback(async (showLoader = true) => {
    const requestId = ++requestIdRef.current;

    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError('');

    try {
      const response = await api.get('/admin/agents');

      if (requestId !== requestIdRef.current) return;

      const agentList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      setAgents(agentList);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(
        err?.message || 'Unable to load agents. Please try again.'
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadAgents();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadAgents]);

  function openCreateModal() {
    setForm({ ...INITIAL_FORM });
    setFormErrors({});
    setCreateError('');
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (isCreating) return;

    setIsCreateOpen(false);
    setFormErrors({});
    setCreateError('');
  }

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => {
      if (!previous[name]) return previous;

      const next = { ...previous };
      delete next[name];
      return next;
    });

    setCreateError('');
  }

  async function handleCreateAgent(event) {
    event.preventDefault();

    if (isCreating) return;

    const validationErrors = validateAgentForm(form);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      await api.post('/admin/agents', {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setIsCreateOpen(false);
      setForm({ ...INITIAL_FORM });

      toast.success('Support agent created successfully.');

      await loadAgents(false);
    } catch (err) {
      const message =
        err?.message || 'Unable to create agent. Please try again.';

      setCreateError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleAgent() {
    if (!selectedAgent || isToggling) return;

    const agent = selectedAgent;
    const isEnabled = agent.enabled === true;
    const action = isEnabled ? 'disable' : 'enable';

    setIsToggling(true);

    try {
      await api.patch(`/admin/agents/${agent.id}/${action}`);

      setSelectedAgent(null);

      toast.success(
        `Agent ${isEnabled ? 'disabled' : 'enabled'} successfully.`
      );

      await loadAgents(false);
    } catch (err) {
      toast.error(
        err?.message ||
          `Unable to ${action} agent. Please try again.`
      );
    } finally {
      setIsToggling(false);
    }
  }

  const enabledAgents = agents.filter(
    (agent) => agent.enabled === true
  ).length;

  const disabledAgents = agents.length - enabledAgents;

  const initialError = Boolean(error) && agents.length === 0;

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
              <UserCog size={17} />
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Administrator Workspace
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Manage Agents
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create support agents, review team members,
            and manage their account access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            leftIcon={RefreshCw}
            onClick={() => loadAgents(false)}
            loading={isRefreshing}
            disabled={isLoading || isRefreshing}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            leftIcon={UserPlus}
            onClick={openCreateModal}
          >
            Add Agent
          </Button>
        </div>
      </header>

      {/* Statistics */}
      <section
        aria-label="Agent statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: 'Total Agents',
            value: agents.length,
            icon: Users,
            color: 'bg-brand-50 text-brand-600',
          },
          {
            label: 'Active Agents',
            value: enabledAgents,
            icon: UserCheck,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Disabled Agents',
            value: disabledAgents,
            icon: UserX,
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
                  {isLoading ? '—' : stat.value}
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

            <p className="text-sm text-rose-700">{error}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => loadAgents()}
            disabled={isLoading || isRefreshing}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Agent list */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-extrabold text-slate-900">
              Support Team
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {isLoading
                ? 'Loading support agents...'
                : `${agents.length} ${
                    agents.length === 1 ? 'agent' : 'agents'
                  } registered`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="Loading agents">
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
        ) : agents.length === 0 && !initialError ? (
          <div className="surface-card px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Users size={29} />
            </div>

            <h3 className="mt-5 font-display text-lg font-extrabold text-slate-900">
              No agents created yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create your first support agent to start
              assigning and resolving tickets.
            </p>

            <div className="mt-6">
              <Button
                variant="primary"
                leftIcon={Plus}
                onClick={openCreateModal}
              >
                Create First Agent
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggle={setSelectedAgent}
                busy={isToggling}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Agent Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        title="Create Support Agent"
        description="Add a new agent to your helpdesk team."
        size="md"
      >
        <form
          id="create-agent-form"
          onSubmit={handleCreateAgent}
          noValidate
          className="space-y-5"
        >
          {createError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-rose-600"
              />

              <p className="text-xs leading-5 text-rose-700">
                {createError}
              </p>
            </div>
          )}

          <Input
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={(event) =>
              updateField('fullName', event.target.value)
            }
            placeholder="Enter agent's full name"
            error={formErrors.fullName}
            required
            disabled={isCreating}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField('email', event.target.value)
            }
            placeholder="agent@example.com"
            error={formErrors.email}
            required
            disabled={isCreating}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(event) =>
              updateField('password', event.target.value)
            }
            placeholder="Minimum 8 characters"
            error={formErrors.password}
            required
            disabled={isCreating}
          />

          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 p-3.5">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-5 text-blue-800">
              The new account will have the AGENT role.
              Share the login credentials securely with
              the intended team member.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border-soft pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
              disabled={isCreating}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              leftIcon={UserPlus}
              loading={isCreating}
            >
              Create Agent
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enable/Disable Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(selectedAgent)}
        onClose={() => {
          if (!isToggling) {
            setSelectedAgent(null);
          }
        }}
        onConfirm={handleToggleAgent}
        title={
          selectedAgent?.enabled
            ? 'Disable Support Agent?'
            : 'Enable Support Agent?'
        }
        description={
          selectedAgent?.enabled
            ? `Are you sure you want to disable ${selectedAgent.fullName}? Their account access will be disabled.`
            : `Are you sure you want to enable ${selectedAgent?.fullName}? Their account access will be restored.`
        }
        confirmText={
          selectedAgent?.enabled ? 'Disable Agent' : 'Enable Agent'
        }
        variant={selectedAgent?.enabled ? 'danger' : 'default'}
        loading={isToggling}
      />
    </div>
  );
}
