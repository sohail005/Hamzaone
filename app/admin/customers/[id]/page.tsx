import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { customers } from "@/data/admin";

export async function generateStaticParams() {
  return customers.map((c) => ({ id: c.id }));
}

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customers } = await api.admin.list("customers");
  const customer = (customers as Array<{ id: string; name: string; email: string; phone: string; orders: string[]; totalSpend: number; joined: string }>).find((c) => c.id === id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/customers" className="text-sm font-semibold text-accent-text">← All customers</Link>
      <h1 className="text-2xl font-bold">{customer.name}</h1>
      <div className="rounded-card bg-surface p-5 shadow-sm">
        <p className="text-sm text-text-muted">{customer.email} · {customer.phone}</p>
        <p className="mt-1 text-sm text-text-muted">Customer since {customer.joined}</p>
        <p className="mt-1 text-sm font-semibold">Total spend: {formatINR(customer.totalSpend)}</p>
      </div>
      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Orders</h2>
        <ul className="flex flex-col gap-2">
          {customer.orders.map((id) => (
            <li key={id}>
              <Link href={`/admin/orders/${id}`} className="text-sm font-medium text-accent-text">{id}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
