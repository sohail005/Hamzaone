export type AdminNotification = {
  id: string;
  label: string;
  href: string;
  kind: "order" | "inventory" | "custom-request";
};

type OrderLike = { id: string; paymentStatus: string };
type InventoryLike = { slug: string; variant: string; low: boolean };
type CustomRequestLike = { id: string; status: string };

export function buildAdminNotifications(data: {
  orders: OrderLike[];
  inventory: InventoryLike[];
  customRequests: CustomRequestLike[];
}): AdminNotification[] {
  const notifications: AdminNotification[] = [];

  for (const r of data.customRequests) {
    if (r.status !== "new") continue;
    notifications.push({ id: `cr-${r.id}`, label: `New custom request ${r.id}`, href: `/admin/custom-requests/${r.id}`, kind: "custom-request" });
  }

  for (const i of data.inventory) {
    if (!i.low) continue;
    notifications.push({ id: `inv-${i.slug}-${i.variant}`, label: `Low stock: ${i.variant}`, href: "/admin/inventory?tab=low", kind: "inventory" });
  }

  for (const o of data.orders) {
    if (o.paymentStatus !== "pending") continue;
    notifications.push({ id: `order-${o.id}`, label: `Pending payment: ${o.id}`, href: `/admin/orders/${o.id}`, kind: "order" });
  }

  return notifications;
}
