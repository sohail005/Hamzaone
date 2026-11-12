import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/Button";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const { orders } = await api.orders.list();
  const demoOrder = orders[0];
  if (!demoOrder) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-text-muted">No orders yet.</p>
        <Link href="/shop"><Button variant="outline">Continue shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Welcome back, {demoOrder.customer}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="rounded-card bg-surface p-5 shadow-sm hover:shadow-md">
          <p className="text-xs text-text-muted">Active orders</p>
          <p className="mt-1 text-2xl font-bold">{orders.length}</p>
        </Link>
        <Link href="/wishlist" className="rounded-card bg-surface p-5 shadow-sm hover:shadow-md">
          <p className="text-xs text-text-muted">Wishlist</p>
          <p className="mt-1 text-2xl font-bold">—</p>
        </Link>
        <Link href="/account/addresses" className="rounded-card bg-surface p-5 shadow-sm hover:shadow-md">
          <p className="text-xs text-text-muted">Saved addresses</p>
          <p className="mt-1 text-2xl font-bold">1</p>
        </Link>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Latest order</h2>
          <Link href={`/account/orders/${demoOrder.id}`} className="text-xs font-semibold text-accent-text">Details</Link>
        </div>
        <p className="mt-2 text-sm text-text-muted">{demoOrder.id} · {formatINR(demoOrder.total)} · {demoOrder.status}</p>
      </div>

      <Link href="/shop"><Button variant="outline">Continue shopping</Button></Link>
    </div>
  );
}
