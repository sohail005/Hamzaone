"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";

type Category = { slug: string; name: string; description: string; enabled?: boolean };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.categories.listAll().then(({ categories }: { categories: Category[] }) => {
      setCategories(categories);
      setLoaded(true);
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

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[500px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Visible</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.slug} className="border-b border-border last:border-0">
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
      </div>

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
