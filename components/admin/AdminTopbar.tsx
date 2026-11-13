"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { api } from "@/lib/api";
import { buildAdminNotifications, type AdminNotification } from "@/lib/notifications";

export function AdminTopbar() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.orders.list(),
      api.admin.list("inventory"),
      api.customCreations.adminList(),
    ])
      .then(([ordersRes, inventoryRes, customCreationsRes]) => {
        if (!active) return;
        setNotifications(
          buildAdminNotifications({
            orders: ordersRes.orders,
            inventory: inventoryRes.inventory,
            customCreations: customCreationsRes.requests,
          }),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const preview = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-5">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input placeholder="Search orders, products, customers…" className="h-10 w-full rounded-full border border-border-input bg-bg pl-9 pr-3 text-sm focus:border-accent" />
      </div>
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-bg">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />}
        </button>
        {open && (
          <div className="absolute right-0 top-full z-30 w-72 rounded-panel bg-surface p-2 shadow-lg">
            {preview.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-text-muted">No new notifications.</p>
            ) : (
              preview.map((n) => (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block rounded-chip px-3 py-2.5 text-sm text-text hover:bg-bg">
                  {n.label}
                </Link>
              ))
            )}
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-chip px-3 py-2.5 text-center text-sm font-semibold text-accent-text hover:bg-bg"
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
