import Link from "next/link";
import { formatINR } from "@/lib/format";
import { getAdminResource } from "@/lib/server/admin-store";
import { getKV, getWorkerEnv } from "@/lib/server/kv";

type Customer = { id: string; name: string; email: string; orders: string[]; totalSpend: number };

export default async function AdminCustomersPage() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  const customers = (kv ? await getAdminResource(kv, "customers") : []) as Customer[];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Customers</h1>
      {customers.length === 0 ? (
        <p className="text-sm text-text-muted">No customers yet.</p>
      ) : (
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
      )}
    </div>
  );
}
