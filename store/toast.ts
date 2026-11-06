"use client";

import { create } from "zustand";

export type Toast = {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, action?: Toast["action"]) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, action) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, message, action }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 4000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
