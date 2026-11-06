"use client";

import { create } from "zustand";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  price: number;
  qty: number;
  engraving?: string;
  availability: "available" | "made-to-order" | "low-stock" | "out-of-stock";
};

type CartState = {
  lines: CartLine[];
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  removeLine: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

function lineId(slug: string, color: string, size: string) {
  return `${slug}__${color}__${size}`;
}

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  addLine: (line) => {
    const id = lineId(line.slug, line.color, line.size);
    const existing = get().lines.find((l) => l.id === id);
    if (existing) {
      set({
        lines: get().lines.map((l) => (l.id === id ? { ...l, qty: l.qty + line.qty } : l)),
      });
    } else {
      set({ lines: [...get().lines, { ...line, id }] });
    }
  },
  removeLine: (id) => set({ lines: get().lines.filter((l) => l.id !== id) }),
  setQty: (id, qty) =>
    set({ lines: get().lines.map((l) => (l.id === id ? { ...l, qty } : l)) }),
  clear: () => set({ lines: [] }),
}));

export function cartTotals(lines: CartLine[]) {
  const billable = lines.filter((l) => l.availability !== "out-of-stock");
  const subtotal = billable.reduce((sum, l) => sum + l.price * l.qty + (l.engraving ? 99 * l.qty : 0), 0);
  return { subtotal, billable };
}
