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
  weightKg?: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
};

type CartState = {
  lines: CartLine[];
  couponCode: string | null;
  couponDiscount: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  removeLine: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setCoupon: (code: string | null, discount: number) => void;
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
      couponDiscount: 0,
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
          return lines.length === 0 ? { lines, couponCode: null, couponDiscount: 0 } : { lines };
        }),
      setQty: (id, qty) =>
        set({ lines: get().lines.map((l) => (l.id === id ? { ...l, qty } : l)) }),
      setCoupon: (couponCode, couponDiscount) => set({ couponCode, couponDiscount }),
      clear: () => set({ lines: [], couponCode: null, couponDiscount: 0 }),
    }),
    {
      name: "hamzaone-cart",
      partialize: (state) => ({ lines: state.lines, couponCode: state.couponCode, couponDiscount: state.couponDiscount }),
      skipHydration: true,
    },
  ),
);

export function cartTotals(lines: CartLine[]) {
  const billable = lines.filter((l) => l.availability !== "out-of-stock");
  const subtotal = billable.reduce((sum, l) => sum + l.price * l.qty + (l.engraving ? 99 * l.qty : 0), 0);
  return { subtotal, billable };
}
