import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";

export default async function TrackOrderPage() {
  const { orders } = await api.orders.list();
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">Track your order</h1>
      <p className="mt-2 text-sm text-text-muted">Enter your order ID to check its status.</p>
      <div className="mt-6 rounded-card bg-surface p-5 shadow-sm">
        <ul className="flex flex-col gap-2">
          {orders.map((o: { id: string; status: string }) => (
            <li key={o.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
              <span className="text-sm">{o.id}</span>
              <span className="text-sm font-semibold">{o.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/contact"><Button>Need help?</Button></Link>
    </div>
  );
}
