"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export type ToastTone = "neutral" | "success" | "warning" | "danger" | "info";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title?: string;
  description?: string;
  durationMs?: number;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function randomId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = (input: Omit<ToastItem, "id">) => {
    const id = randomId();
    const item: ToastItem = { id, ...input, tone: input.tone ?? "neutral" };
    setItems((prev) => [item, ...prev]);

    const duration = item.durationMs ?? 3500;
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const dismiss = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastViewport({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="ui-toast-region" aria-live="polite" aria-relevant="additions removals">
      {items.map((t) => (
        <div key={t.id} className={cx("ui-toast", `ui-toast--${t.tone}`)} role="status">
          <div className="ui-toast__content">
            {t.title ? <div className="text-label ui-toast__title">{t.title}</div> : null}
            {t.description ? <div className="text-body-small ui-toast__desc">{t.description}</div> : null}
          </div>
          <button className="ui-toast__close ui-focus-ring" type="button" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
