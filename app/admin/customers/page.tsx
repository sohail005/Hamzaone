import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";

export default async function AdminCustomersPage() {
  const { customers } = await api.admin.list("customers");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spend</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: { id: string; name: string; email: string; orders: string[]; totalSpend: number }) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><Link href={`/admin/customers/${c.id}`} className="font-medium text-accent-text">{c.name}</Link></td>
                <td className="px-4 py-3 text-text-muted">{c.email}</td>
                <td className="px-4 py-3">{c.orders.length}</td>
                <td className="px-4 py-3">{formatINR(c.totalSpend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
