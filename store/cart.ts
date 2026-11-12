"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  couponCode: string | null;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  removeLine: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setCouponCode: (code: string | null) => void;
  clear: () => void;
};

function lineId(slug: string, color: string, size: string) {
  return `${slug}__${color}__${size}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,
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
      removeLine: (id) =>
        set((state) => {
          const lines = state.lines.filter((line) => line.id !== id);
          return lines.length === 0 ? { lines, couponCode: null } : { lines };
        }),
      setQty: (id, qty) =>
        set({ lines: get().lines.map((l) => (l.id === id ? { ...l, qty } : l)) }),
      setCouponCode: (couponCode) => set({ couponCode }),
      clear: () => set({ lines: [], couponCode: null }),
    }),
    {
      name: "hamzaone-cart",
      partialize: (state) => ({ lines: state.lines, couponCode: state.couponCode }),
      skipHydration: true,
    },
  ),
);

export function cartTotals(lines: CartLine[]) {
  const billable = lines.filter((l) => l.availability !== "out-of-stock");
  const subtotal = billable.reduce((sum, l) => sum + l.price * l.qty + (l.engraving ? 99 * l.qty : 0), 0);
  return { subtotal, billable };
}
