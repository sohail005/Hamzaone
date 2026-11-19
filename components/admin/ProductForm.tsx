"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import { api } from "@/lib/api";
import { assetUrl } from "@/lib/assets";
import { Field, Textarea } from "@/components/Input";
import { Button } from "@/components/Button";
import { ConceptRender } from "@/components/ConceptRender";

// Suggests a swatch colour as the admin types, using the browser's own CSS
// colour parser (not a hand-picked list) so any of the ~150 standard CSS
// colour names (and compound names like "Ivory White") resolve to their
// exact real value. Admins can still override via the picker.
function cssNameToHex(value: string): string | null {
  if (typeof document === "undefined") return null;
  const probe = document.createElement("span");
  probe.style.color = "";
  probe.style.color = value;
  if (!probe.style.color) return null;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const channels = rgb.match(/[\d.]+/g);
  if (!channels || channels.length < 3) return null;
  const toHex = (v: string) => Math.round(Number(v)).toString(16).padStart(2, "0");
  return `#${toHex(channels[0])}${toHex(channels[1])}${toHex(channels[2])}`;
}

function suggestColorHex(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const direct = cssNameToHex(trimmed);
  if (direct) return direct;
  // Compound names (e.g. "Ivory White") aren't valid CSS values on their
  // own — fall back to the last word, which is usually the base colour.
  const words = trimmed.split(/\s+/);
  for (let i = words.length - 1; i >= 0; i--) {
    const match = cssNameToHex(words[i]);
    if (match) return match;
  }
  return null;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "",
    price: product?.price ? String(product.price) : "",
    stock: product?.stock !== undefined ? String(product.stock) : "",
    material: product?.material ?? "PLA",
    description: product?.description ?? "",
    weightKg: product?.weightKg ? String(product.weightKg) : "",
    lengthCm: product?.lengthCm ? String(product.lengthCm) : "",
    breadthCm: product?.breadthCm ? String(product.breadthCm) : "",
    heightCm: product?.heightCm ? String(product.heightCm) : "",
    imageKeys: product?.imageKeys ?? [],
    videoKey: product?.videoKey,
    colors: product?.colors ?? [],
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
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#cccccc");
  const [newColorHexTouched, setNewColorHexTouched] = useState(false);
  const [newColorError, setNewColorError] = useState<string | null>(null);

  async function onImageFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setImageError(null);
    setImageUploading(true);
    try {
      const storageKeys = await Promise.all(files.map((file) => api.admin.uploadAsset(file, "products").then((r) => r.storageKey)));
      setForm((f) => ({ ...f, imageKeys: [...f.imageKeys, ...storageKeys] }));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setImageUploading(false);
    }
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, imageKeys: f.imageKeys.filter((_, i) => i !== index) }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setForm((f) => {
      const target = index + direction;
      if (target < 0 || target >= f.imageKeys.length) return f;
      const imageKeys = [...f.imageKeys];
      [imageKeys[index], imageKeys[target]] = [imageKeys[target], imageKeys[index]];
      return { ...f, imageKeys };
    });
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

  function isHexLike(value: string) {
    const trimmed = value.trim();
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash);
  }

  function addColor() {
    const name = newColorName.trim();
    if (!name) return;
    if (isHexLike(name)) {
      setNewColorError("Enter a descriptive colour name, e.g. Cream — not a hex code.");
      return;
    }
    setNewColorError(null);
    setForm((f) => {
      if (f.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return f;
      return { ...f, colors: [...f.colors, { name, hex: newColorHex }] };
    });
    setNewColorName("");
    setNewColorHex("#cccccc");
    setNewColorHexTouched(false);
  }

  function removeColor(name: string) {
    setForm((f) => ({ ...f, colors: f.colors.filter((c) => c.name !== name) }));
  }

  async function publish() {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Name is required.";
    if (!form.price || Number(form.price) <= 0) e.price = "Price must be greater than 0.";
    if (form.colors.length === 0) e.colors = "Select at least one colour.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const stock = form.stock.trim() === "" ? undefined : Math.max(0, Number(form.stock));
    const toNumber = (value: string) => (value.trim() === "" ? undefined : Number(value));
    const payload = {
      ...form,
      price: Number(form.price),
      stock,
      weightKg: toNumber(form.weightKg),
      lengthCm: toNumber(form.lengthCm),
      breadthCm: toNumber(form.breadthCm),
      heightCm: toNumber(form.heightCm),
    };

    setSaving(true);
    try {
      if (product) {
        await api.products.update(product.slug, payload);
      } else {
        await api.products.create({ ...payload, availability: "available", shape: "vase" });
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
          <Field id="price" label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price} />
          <Field
            id="stock"
            label="Available stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="Leave blank to not track stock"
            hint="Decreases automatically as paid orders come in. The product goes out of stock at 0."
          />

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

          <div>
            <label className="text-sm font-semibold">Colours</label>
            {form.colors.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {form.colors.map((color) => (
                  <span
                    key={color.name}
                    className="flex h-10 items-center gap-2 rounded-full border border-border-input pl-3 pr-2 text-sm"
                  >
                    <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                    {color.name}
                    <button type="button" aria-label={`Remove ${color.name}`} onClick={() => removeColor(color.name)} className="text-text-muted">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                aria-label="Swatch colour"
                value={newColorHex}
                onChange={(e) => {
                  setNewColorHex(e.target.value);
                  setNewColorHexTouched(true);
                }}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-input border border-border-input bg-surface p-0.5"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewColorName(name);
                  if (!newColorHexTouched) {
                    setNewColorHex(suggestColorHex(name) ?? "#cccccc");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                placeholder="Colour name, e.g. Terracotta"
                className="h-10 flex-1 rounded-input border border-border-input bg-surface px-3 text-sm"
              />
              <Button type="button" variant="outline" size="sm" disabled={!newColorName.trim()} onClick={addColor}>Add</Button>
            </div>
            <p className="mt-1.5 text-xs text-text-muted">Pick the swatch colour so customers see the real shade.</p>
            {newColorError && <p className="mt-1.5 text-xs text-error-text">{newColorError}</p>}
            {errors.colors && <p className="mt-1.5 text-xs text-error-text">{errors.colors}</p>}
          </div>

          <h2 className="mt-2 text-sm font-semibold">Shipping dimensions</h2>
          <p className="-mt-3 text-xs text-text-muted">Packed weight and size, used for courier delivery estimates.</p>
          <div className="grid grid-cols-2 gap-4">
            <Field id="weightKg" label="Weight (kg)" type="number" step="0.01" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
            <Field id="lengthCm" label="Length (cm)" type="number" value={form.lengthCm} onChange={(e) => setForm({ ...form, lengthCm: e.target.value })} />
            <Field id="breadthCm" label="Breadth (cm)" type="number" value={form.breadthCm} onChange={(e) => setForm({ ...form, breadthCm: e.target.value })} />
            <Field id="heightCm" label="Height (cm)" type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Images</h2>
            {form.imageKeys[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(form.imageKeys[0])} alt="" className="aspect-square w-full rounded-chip object-cover" />
            ) : (
              <ConceptRender shape="vase" color="#C2693C" className="aspect-square rounded-chip" />
            )}
            {form.imageKeys.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {form.imageKeys.map((key, i) => (
                  <div key={i} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl(key)} alt="" className="aspect-square w-full rounded-chip object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded-full bg-dark/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Primary</span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-0.5 opacity-0 group-hover:opacity-100">
                      <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => moveImage(i, -1)} className="text-white disabled:opacity-30">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Remove image" onClick={() => removeImage(i)} className="text-white">
                        <X className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Move right" disabled={i === form.imageKeys.length - 1} onClick={() => moveImage(i, 1)} className="text-white disabled:opacity-30">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={imageUploading} onClick={() => imageFileInput.current?.click()}>
                {imageUploading ? "Uploading…" : "Add images"}
              </Button>
            </div>
            <input ref={imageFileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onImageFilesChosen} />
            {imageError && <p className="mt-2 text-xs text-error-text">{imageError}</p>}
            {form.imageKeys.length === 0 && <p className="mt-2 text-xs text-text-muted">No images uploaded yet — shown as a concept render until you add one.</p>}
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
