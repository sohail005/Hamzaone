export type AdminNotification = {
  id: string;
  label: string;
  href: string;
  kind: "order" | "inventory" | "custom-creation";
};

type OrderLike = { id: string; paymentStatus: string };
type InventoryLike = { slug: string; variant: string; low: boolean };
type CustomCreationLike = { id: string; status: string };

export function buildAdminNotifications(data: {
  orders: OrderLike[];
  inventory: InventoryLike[];
  customCreations: CustomCreationLike[];
}): AdminNotification[] {
  const notifications: AdminNotification[] = [];

  for (const r of data.customCreations) {
    if (r.status !== "PENDING_REVIEW") continue;
    notifications.push({ id: `cc-${r.id}`, label: `New custom creation request ${r.id}`, href: `/admin/custom-creations/${r.id}`, kind: "custom-creation" });
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
