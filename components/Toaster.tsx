"use client";

import { useToast } from "@/store/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="flex items-center gap-3 rounded-full bg-dark px-5 py-3 text-sm text-white shadow-lg"
        >
          <span>{t.message}</span>
          {t.action && (
            <button onClick={t.action.onClick} className="font-semibold text-accent underline-offset-2 hover:underline">
              {t.action.label}
            </button>
          )}
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/60 hover:text-white">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
