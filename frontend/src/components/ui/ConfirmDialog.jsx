
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';

import Modal from './Modal';
import Button from './Button';

const VARIANT_CONFIG = {
  danger: {
    Icon: AlertTriangle,
    iconContainer: 'bg-rose-50 ring-rose-100',
    iconColor: 'text-rose-600',
    buttonVariant: 'danger',
  },
  warning: {
    Icon: AlertTriangle,
    iconContainer: 'bg-amber-50 ring-amber-100',
    iconColor: 'text-amber-600',
    buttonVariant: 'primary',
  },
  info: {
    Icon: Info,
    iconContainer: 'bg-brand-50 ring-brand-100',
    iconColor: 'text-brand-600',
    buttonVariant: 'primary',
  },
  default: {
    Icon: HelpCircle,
    iconContainer: 'bg-slate-100 ring-slate-200',
    iconColor: 'text-slate-600',
    buttonVariant: 'primary',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'Please confirm that you want to continue.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  disabled = false,
  children,
}) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default;
  const Icon = config.Icon;

  const isBusy = loading || disabled;

  function handleConfirm() {
    if (isBusy || typeof onConfirm !== 'function') {
      return;
    }

    onConfirm();
  }

  function handleClose() {
    if (isBusy) {
      return;
    }

    onClose?.();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnBackdrop={!isBusy}
      closeOnEscape={!isBusy}
      showCloseButton={!isBusy}
      footer={
        <div className="flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isBusy}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>

          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
            disabled={disabled}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={[
            'flex h-14 w-14 items-center justify-center',
            'rounded-2xl ring-1 ring-inset',
            config.iconContainer,
          ].join(' ')}
        >
          <Icon
            size={26}
            strokeWidth={1.8}
            className={config.iconColor}
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-5 font-display text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        {children && (
          <div className="mt-5 w-full text-left">
            {children}
          </div>
        )}
      </div>
    </Modal>
  );
}
