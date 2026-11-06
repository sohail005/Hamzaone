"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Bell } from "lucide-react";

const NOTIFICATIONS = [
  { label: "New custom request CPR-2611-0738", href: "/admin/custom-requests/CPR-2611-0738" },
  { label: "Low stock: Hex Pen Cup", href: "/admin/inventory?tab=low" },
  { label: "Pending payment: HO-2026-10479", href: "/admin/orders/HO-2026-10479" },
];

export function AdminTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-5">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input placeholder="Search orders, products, customers…" className="h-10 w-full rounded-full border border-border-input bg-bg pl-9 pr-3 text-sm focus:border-accent" />
      </div>
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-bg">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-30 w-72 rounded-panel bg-surface p-2 shadow-lg">
            {NOTIFICATIONS.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="block rounded-chip px-3 py-2.5 text-sm text-text hover:bg-bg">
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
