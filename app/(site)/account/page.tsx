import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Package, ShoppingBag, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { AccountStats } from "@/components/AccountStats";
import { Button } from "@/components/Button";
import { StatusChip } from "@/components/StatusChip";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "My Account" };

type Address = { id: string; line1: string; city: string; state: string; pin: string; isDefault: boolean };
type OrderSummary = { id: string; total: number; status: string; paymentStatus: string; items: Array<{ name: string }> };

export default async function AccountOverviewPage() {
  const [user, { orders }, { addresses }] = await Promise.all([
    getCurrentUser(),
    api.orders.list() as Promise<{ orders: OrderSummary[] }>,
    api.addresses.list() as Promise<{ addresses: Address[] }>,
  ]);
  const greetingName = user?.name ?? "there";
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-card bg-surface p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mto-chip-bg" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-32 w-32 rounded-full bg-accent/10" />
        <div className="relative flex items-center gap-4">
          <Avatar name={greetingName} src={user?.avatarUrl} size={56} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">Welcome back</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{greetingName} 👋</h1>
            <p className="mt-1 text-sm text-text-muted">Here&apos;s your account overview and quick access to your orders.</p>
          </div>
        </div>
      </div>

      <AccountStats ordersCount={orders.length} addressesCount={addresses.length} />

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent-text" />
            <h2 className="text-sm font-semibold">Profile Details</h2>
          </div>
          <Link href="/account/profile" className="flex items-center gap-1 rounded-full bg-mto-chip-bg px-3 py-1.5 text-xs font-semibold text-accent-text">
            <Pencil className="h-3 w-3" /> Edit Profile
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-border">
          <div className="flex items-start gap-2 sm:pr-4">
            <Mail className="mt-0.5 h-4 w-4 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:px-4">
            <Phone className="mt-0.5 h-4 w-4 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Phone</p>
              <p className="text-sm font-medium">{user?.phone || "Not added yet"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:pl-4">
            <MapPin className="mt-0.5 h-4 w-4 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Address</p>
              <p className="text-sm font-medium">
                {defaultAddress ? `${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.pin}` : "Not added yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-accent-text" />
            <h2 className="text-sm font-semibold">My Orders</h2>
          </div>
          <Link href="/account/orders" className="text-xs font-semibold text-accent-text">View All Orders →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mto-chip-bg text-accent-text">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold">No orders yet.</p>
              <p className="text-xs text-text-muted">Start shopping and your orders will appear here.</p>
            </div>
            <Link href="/shop"><Button>Continue Shopping →</Button></Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex items-center justify-between rounded-chip border border-border px-4 py-3 hover:bg-bg">
                  <div>
                    <p className="text-sm font-semibold">{o.id}</p>
                    <p className="text-xs text-text-muted">{o.items.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatINR(o.total)}</span>
                    <StatusChip tone={o.status === "delivered" ? "success" : o.paymentStatus === "pending" ? "warning" : "accent"}>{o.status}</StatusChip>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
