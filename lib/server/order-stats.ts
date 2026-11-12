export type OrderStatsInput = {
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items?: Array<{ name: string; qty: number; unitPrice: number }>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeOrderStats(orders: OrderStatsInput[]) {
  const now = Date.now();
  const recent = orders.filter((o) => now - new Date(o.createdAt).getTime() <= 30 * DAY_MS);
  const paidRecent = recent.filter((o) => o.paymentStatus === "paid");

  const revenue30d = paidRecent.reduce((sum, o) => sum + o.total, 0);
  const orders30d = recent.length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending").length;
  const avgOrderValue = paidRecent.length > 0 ? Math.round(revenue30d / paidRecent.length) : 0;

  const salesBars: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = new Date(now - i * DAY_MS);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + DAY_MS);
    const dayRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .filter((o) => {
        const createdAt = new Date(o.createdAt).getTime();
        return createdAt >= dayStart.getTime() && createdAt < dayEnd.getTime();
      })
      .reduce((sum, o) => sum + o.total, 0);
    salesBars.push(dayRevenue);
  }
  const maxDay = Math.max(...salesBars, 1);
  const salesBarHeights = salesBars.map((v) => Math.round((v / maxDay) * 100));

  const topProductsMap = new Map<string, number>();
  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    for (const item of order.items ?? []) {
      topProductsMap.set(item.name, (topProductsMap.get(item.name) ?? 0) + item.qty * item.unitPrice);
    }
  }
  const topProducts = [...topProductsMap.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  return { revenue30d, orders30d, pendingOrders, avgOrderValue, salesBarHeights, topProducts };
}
