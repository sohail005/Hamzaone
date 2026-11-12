"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useCart, cartTotals } from "@/store/cart";
import { formatINR } from "@/lib/format";
import { Button } from "./Button";

export function CartDrawer() {
  const { lines, drawerOpen, closeDrawer, removeLine } = useCart(
    useShallow((state) => ({
      lines: state.lines,
      drawerOpen: state.drawerOpen,
      closeDrawer: state.closeDrawer,
      removeLine: state.removeLine,
    })),
  );
  const { subtotal } = cartTotals(lines);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (drawerOpen) closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold">Your cart</h2>
          <button ref={closeRef} onClick={closeDrawer} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <p className="text-sm text-text-muted">Your cart is empty.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-text-muted">{l.color} · {l.size} · Qty {l.qty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatINR(l.price * l.qty)}</span>
                    <button onClick={() => removeLine(l.id)} className="text-xs text-error-text hover:underline">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border p-5">
          <div className="mb-4 flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <Link href="/checkout" onClick={closeDrawer}>
            <Button className="w-full" disabled={lines.length === 0}>
              Checkout
            </Button>
          </Link>
          <Link href="/cart" onClick={closeDrawer} className="mt-3 block text-center text-sm font-semibold text-accent-text">
            View full cart
          </Link>
        </div>
      </div>
    </div>
  );
}
