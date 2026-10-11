'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react/dist/ssr';

type ToastKind = 'info' | 'ok' | 'bad';

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastContextValue {
  push: (text: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_ICON: Record<ToastKind, typeof Info> = {
  info: Info,
  ok: CheckCircle,
  bad: WarningCircle,
};

const KIND_COLOR: Record<ToastKind, string> = {
  info: 'var(--signal)',
  ok: 'var(--ok)',
  bad: 'var(--bad)',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (text: string, kind: ToastKind = 'info') => {
      const id = nextId.current++;
      setItems((prev) => [...prev.slice(-3), { id, kind, text }]);
      window.setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col items-end gap-2"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = KIND_ICON[t.kind];
          return (
            <div key={t.id} className="toast" role="status">
              <Icon size={16} weight="bold" color={KIND_COLOR[t.kind]} aria-hidden />
              <p className="m-0 flex-1 text-[12.5px] leading-snug text-[var(--dim)]">{t.text}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="btn-icon !h-6 !w-6 !border-0 !bg-transparent"
              >
                <X size={12} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: () => {} };
  }
  return ctx;
}