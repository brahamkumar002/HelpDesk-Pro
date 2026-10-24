
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    backgroundClass: 'bg-emerald-50',
    borderClass: 'border-l-emerald-500',
    defaultTitle: 'Success',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-600',
    backgroundClass: 'bg-rose-50',
    borderClass: 'border-l-rose-500',
    defaultTitle: 'Something went wrong',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    backgroundClass: 'bg-amber-50',
    borderClass: 'border-l-amber-500',
    defaultTitle: 'Attention needed',
  },
  info: {
    icon: Info,
    iconClass: 'text-brand-600',
    backgroundClass: 'bg-brand-50',
    borderClass: 'border-l-brand-500',
    defaultTitle: 'Information',
  },
};

const DEFAULT_DURATION = 4500;
const MAX_TOASTS = 4;

function ToastItem({ toast, onDismiss }) {
  const config = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={[
        'animate-enter pointer-events-auto flex w-full items-start gap-3',
        'rounded-xl border border-slate-200/80 border-l-[3px]',
        'bg-white p-4 shadow-float',
        config.borderClass,
      ].join(' ')}
    >
      <div
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          config.backgroundClass,
        ].join(' ')}
      >
        <Icon
          size={19}
          strokeWidth={2}
          className={config.iconClass}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold leading-5 text-slate-900">
          {toast.title || config.defaultTitle}
        </p>

        {toast.message && (
          <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <X size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const nextIdRef = useRef(0);

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    ({
      type = 'info',
      title,
      message = '',
      duration = DEFAULT_DURATION,
    }) => {
      const id = ++nextIdRef.current;

      setToasts((current) => {
        const updated = [
          ...current,
          {
            id,
            type,
            title,
            message,
          },
        ];

        if (updated.length > MAX_TOASTS) {
          const removed = updated.slice(0, -MAX_TOASTS);

          removed.forEach((toast) => {
            const timer = timersRef.current.get(toast.id);

            if (timer !== undefined) {
              clearTimeout(timer);
              timersRef.current.delete(toast.id);
            }
          });
        }

        return updated.slice(-MAX_TOASTS);
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);

        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (message, title = 'Success') =>
      showToast({ type: 'success', title, message }),
    [showToast]
  );

  const error = useCallback(
    (message, title = 'Something went wrong') =>
      showToast({ type: 'error', title, message, duration: 6000 }),
    [showToast]
  );

  const warning = useCallback(
    (message, title = 'Attention needed') =>
      showToast({ type: 'warning', title, message }),
    [showToast]
  );

  const info = useCallback(
    (message, title = 'Information') =>
      showToast({ type: 'info', title, message }),
    [showToast]
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      <div
        className={[
          'pointer-events-none fixed inset-x-4 top-4 z-[100]',
          'flex flex-col gap-3',
          'sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[380px]',
        ].join(' ')}
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
