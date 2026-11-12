"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import { api } from "@/lib/api";
import { Field, Textarea } from "@/components/Input";
import { Button } from "@/components/Button";
import { ConceptRender } from "@/components/ConceptRender";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "",
    price: product?.price ?? 0,
    material: product?.material ?? "PLA",
    description: product?.description ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categories
      .list()
      .then(({ categories: list }: { categories: Category[] }) => {
        setCategories(list);
        if (!form.category && list.length > 0) {
          setForm((f) => ({ ...f, category: list[0].slug }));
        }
      })
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveDraft() {
    setSaved("Draft saved locally — publish to save to the catalog.");
    setTimeout(() => setSaved(null), 2500);
  }

  async function publish() {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Name is required.";
    if (!form.price || form.price <= 0) e.price = "Price must be greater than 0.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      if (product) {
        await api.products.update(product.slug, form);
      } else {
        await api.products.create({ ...form, availability: "available", colors: [], shape: "vase" });
      }
      router.push("/admin/products?published=1");
    } catch (error) {
      setErrors({ name: error instanceof Error ? error.message : "Could not save the product." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Details</h2>
          <Field id="name" label="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Textarea id="description" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1.5 h-12 w-full rounded-input border border-border-input bg-surface px-4 text-sm"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <Field id="price" label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} error={errors.price} />

          <h2 className="mt-2 text-sm font-semibold">Manufacturing</h2>
          <div>
            <label className="text-sm font-semibold">Material</label>
            <select
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              className="mt-1.5 h-12 w-full rounded-input border border-border-input bg-surface px-4 text-sm"
            >
              <option>PLA</option>
              <option>PETG</option>
              <option>TPU</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Images</h2>
            <ConceptRender shape="vase" color="#C2693C" className="aspect-square rounded-chip" />
            <p className="mt-2 text-xs text-text-muted">Concept render — no real uploads in this prototype.</p>
          </div>
          <div className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-sm">
            <Button variant="outline" onClick={() => setPreview(true)}>Preview</Button>
            <Button variant="outline" onClick={saveDraft}>Save draft</Button>
            {saved && <p className="text-xs text-success-text">{saved}</p>}
            <Button onClick={publish} disabled={saving}>{saving ? "Saving…" : "Publish"}</Button>
            <Button variant="ghost" onClick={() => router.push("/admin/products")}>Cancel</Button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreview(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">{form.name || "Untitled product"}</h3>
            <p className="mt-1 text-sm text-text-muted">₹{form.price || 0}</p>
            <p className="mt-2 text-sm text-text-muted">{form.description}</p>
            <Button className="mt-5 w-full" onClick={() => setPreview(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
