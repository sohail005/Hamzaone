"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import { api } from "@/lib/api";
import { assetUrl } from "@/lib/assets";
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
    weightKg: product?.weightKg ?? 0,
    lengthCm: product?.lengthCm ?? 0,
    breadthCm: product?.breadthCm ?? 0,
    heightCm: product?.heightCm ?? 0,
    imageKey: product?.imageKey,
    videoKey: product?.videoKey,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageFileInput = useRef<HTMLInputElement | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoFileInput = useRef<HTMLInputElement | null>(null);

  async function onImageFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError(null);
    setImageUploading(true);
    try {
      const { storageKey } = await api.admin.uploadAsset(file, "products");
      setForm((f) => ({ ...f, imageKey: storageKey }));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setImageUploading(false);
    }
  }

  async function onVideoFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setVideoError(null);
    setVideoUploading(true);
    try {
      const { storageKey } = await api.admin.uploadAsset(file, "products");
      setForm((f) => ({ ...f, videoKey: storageKey }));
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setVideoUploading(false);
    }
  }

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

          <h2 className="mt-2 text-sm font-semibold">Shipping dimensions</h2>
          <p className="-mt-3 text-xs text-text-muted">Packed weight and size, used for courier delivery estimates.</p>
          <div className="grid grid-cols-2 gap-4">
            <Field id="weightKg" label="Weight (kg)" type="number" step="0.01" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} />
            <Field id="lengthCm" label="Length (cm)" type="number" value={form.lengthCm} onChange={(e) => setForm({ ...form, lengthCm: Number(e.target.value) })} />
            <Field id="breadthCm" label="Breadth (cm)" type="number" value={form.breadthCm} onChange={(e) => setForm({ ...form, breadthCm: Number(e.target.value) })} />
            <Field id="heightCm" label="Height (cm)" type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Images</h2>
            {form.imageKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(form.imageKey)} alt="" className="aspect-square w-full rounded-chip object-cover" />
            ) : (
              <ConceptRender shape="vase" color="#C2693C" className="aspect-square rounded-chip" />
            )}
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={imageUploading} onClick={() => imageFileInput.current?.click()}>
                {imageUploading ? "Uploading…" : form.imageKey ? "Replace image" : "Upload image"}
              </Button>
              {form.imageKey && (
                <Button type="button" variant="ghost" size="sm" disabled={imageUploading} onClick={() => setForm((f) => ({ ...f, imageKey: undefined }))}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={imageFileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageFileChosen} />
            {imageError && <p className="mt-2 text-xs text-error-text">{imageError}</p>}
            {!form.imageKey && <p className="mt-2 text-xs text-text-muted">No image uploaded yet — shown as a concept render until you add one.</p>}
          </div>
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Video (optional)</h2>
            {form.videoKey && (
              <video src={assetUrl(form.videoKey)} controls muted playsInline className="aspect-square w-full rounded-chip bg-black object-contain" />
            )}
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={videoUploading} onClick={() => videoFileInput.current?.click()}>
                {videoUploading ? "Uploading…" : form.videoKey ? "Replace video" : "Upload video"}
              </Button>
              {form.videoKey && (
                <Button type="button" variant="ghost" size="sm" disabled={videoUploading} onClick={() => setForm((f) => ({ ...f, videoKey: undefined }))}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={videoFileInput} type="file" accept="video/mp4,video/webm" className="hidden" onChange={onVideoFileChosen} />
            {videoError && <p className="mt-2 text-xs text-error-text">{videoError}</p>}
            <p className="mt-2 text-xs text-text-muted">A short MP4/WEBM clip (max 50 MB), shown on the product page. Skip this if you don&apos;t have one.</p>
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
