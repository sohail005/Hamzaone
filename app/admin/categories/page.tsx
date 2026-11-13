"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { assetUrl } from "@/lib/assets";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";

type Category = { slug: string; name: string; description: string; enabled?: boolean; imageKey?: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [heroImageKey, setHeroImageKey] = useState<string | undefined>(undefined);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);

  const categoryFileInput = useRef<HTMLInputElement | null>(null);
  const heroFileInput = useRef<HTMLInputElement | null>(null);
  const uploadTargetSlug = useRef<string | null>(null);

  useEffect(() => {
    api.categories.listAll().then(({ categories }: { categories: Category[] }) => {
      setCategories(categories);
      setLoaded(true);
    });
    api.homeSettings.get().then(({ settings }) => {
      setHeroImageKey(settings.heroImageKey);
    });
  }, []);

  async function toggleVisibility(category: Category) {
    const nextEnabled = category.enabled === false;
    setCategories((cs) => cs.map((c) => (c.slug === category.slug ? { ...c, enabled: nextEnabled } : c)));
    try {
      await api.categories.update(category.slug, { enabled: nextEnabled });
    } catch {
      setCategories((cs) => cs.map((c) => (c.slug === category.slug ? { ...c, enabled: category.enabled } : c)));
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const { category } = await api.categories.create({ name: newName.trim() });
      setCategories((cs) => [...cs, category]);
      setNewName("");
    } finally {
      setCreating(false);
    }
  }

  function pickCategoryImage(slug: string) {
    uploadTargetSlug.current = slug;
    categoryFileInput.current?.click();
  }

  async function onCategoryFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const slug = uploadTargetSlug.current;
    e.target.value = "";
    if (!file || !slug) return;
    setImageError(null);
    setUploadingSlug(slug);
    try {
      const { storageKey } = await api.admin.uploadAsset(file, "categories");
      const { category } = await api.categories.update(slug, { imageKey: storageKey });
      setCategories((cs) => cs.map((c) => (c.slug === slug ? category : c)));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingSlug(null);
    }
  }

  async function removeCategoryImage(category: Category) {
    setImageError(null);
    setUploadingSlug(category.slug);
    try {
      const { category: updated } = await api.categories.update(category.slug, { imageKey: null });
      setCategories((cs) => cs.map((c) => (c.slug === category.slug ? updated : c)));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Could not remove image.");
    } finally {
      setUploadingSlug(null);
    }
  }

  async function onHeroFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setHeroError(null);
    setHeroUploading(true);
    try {
      const { storageKey } = await api.admin.uploadAsset(file, "hero");
      await api.homeSettings.update({ heroImageKey: storageKey });
      setHeroImageKey(storageKey);
    } catch (err) {
      setHeroError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setHeroUploading(false);
    }
  }

  async function removeHeroImage() {
    setHeroError(null);
    setHeroUploading(true);
    try {
      await api.homeSettings.update({ heroImageKey: null });
      setHeroImageKey(undefined);
    } catch (err) {
      setHeroError(err instanceof Error ? err.message : "Could not remove image.");
    } finally {
      setHeroUploading(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold">Homepage feature image</h2>
        <p className="mb-3 text-sm text-text-muted">Shown in the hero section on the homepage. Falls back to the default concept art when none is set.</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-card bg-art-tile text-xs text-text-muted">
            {heroImageKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(heroImageKey)} alt="" className="h-full w-full object-cover" />
            ) : (
              "No image"
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={heroUploading} onClick={() => heroFileInput.current?.click()}>
                {heroUploading ? "Uploading…" : heroImageKey ? "Replace image" : "Upload image"}
              </Button>
              {heroImageKey && (
                <Button type="button" variant="ghost" disabled={heroUploading} onClick={removeHeroImage}>
                  Remove
                </Button>
              )}
            </div>
            {heroError && <p className="text-sm text-error-text">{heroError}</p>}
          </div>
          <input ref={heroFileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onHeroFileChosen} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Visible</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-chip bg-art-tile text-[10px] text-text-muted">
                      {c.imageKey ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={assetUrl(c.imageKey)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "None"
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="text-left text-xs font-semibold text-accent-text disabled:opacity-50"
                        disabled={uploadingSlug === c.slug}
                        onClick={() => pickCategoryImage(c.slug)}
                      >
                        {uploadingSlug === c.slug ? "Uploading…" : c.imageKey ? "Replace" : "Upload"}
                      </button>
                      {c.imageKey && (
                        <button
                          type="button"
                          className="text-left text-xs text-text-muted disabled:opacity-50"
                          disabled={uploadingSlug === c.slug}
                          onClick={() => removeCategoryImage(c)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-text-muted">{c.description}</td>
                <td className="px-4 py-3 text-right">
                  <Toggle
                    checked={c.enabled !== false}
                    onChange={() => toggleVisibility(c)}
                    label={`Toggle visibility for ${c.name}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <input ref={categoryFileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onCategoryFileChosen} />
      </div>
      {imageError && <p className="text-sm text-error-text">{imageError}</p>}

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Create category</h2>
        <form onSubmit={createCategory} className="flex gap-3">
          <Field id="new-category" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" className="flex-1" />
          <Button type="submit" disabled={creating}>Create</Button>
        </form>
      </div>
    </div>
  );
}
