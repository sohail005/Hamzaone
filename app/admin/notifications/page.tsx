"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Package, AlertTriangle, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { buildAdminNotifications, type AdminNotification } from "@/lib/notifications";

const ICONS: Record<AdminNotification["kind"], typeof Package> = {
  "custom-creation": Package,
  inventory: AlertTriangle,
  order: CreditCard,
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

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
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-10 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mto-chip-bg text-accent-text">
            <Bell className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold">You&apos;re all caught up.</p>
          <p className="text-sm text-text-muted">New custom creation requests, low-stock alerts and pending payments will show up here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 rounded-card bg-surface p-2 shadow-sm">
          {notifications.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <li key={n.id}>
                <Link href={n.href} className="flex items-center gap-3 rounded-chip px-3 py-3 text-sm hover:bg-bg">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mto-chip-bg text-accent-text">
                    <Icon className="h-4 w-4" />
                  </span>
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
