"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AvailabilityChip } from "@/components/StatusChip";
import { Button } from "@/components/Button";

type Product = { slug: string; name: string; category: string; price: number; availability: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products.list().then(({ products }: { products: Product[] }) => {
      setProducts(products);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  async function confirmDelete() {
    if (!deleting) return;
    setWorking(true);
    setError(null);
    try {
      await api.products.remove(deleting);
      setProducts((p) => p.filter((x) => x.slug !== deleting));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this product.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories"><Button variant="outline">Categories</Button></Link>
          <Link href="/admin/products/new"><Button>Add product</Button></Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-text-muted">{p.category}</td>
                <td className="px-4 py-3">{formatINR(p.price)}</td>
                <td className="px-4 py-3"><AvailabilityChip status={(p.availability as unknown as "available")} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.slug}/edit`} className="mr-3 text-xs font-semibold text-accent-text">Edit</Link>
                  <button onClick={() => setDeleting(p.slug)} className="text-xs font-semibold text-error-text">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !working && setDeleting(null)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">Delete product?</h3>
            <p className="mt-2 text-sm text-text-muted">This permanently removes it from the storefront and catalog. This cannot be undone.</p>
            {error && <p className="mt-2 text-sm text-error-text">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" disabled={working} onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="destructive" loading={working} onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
