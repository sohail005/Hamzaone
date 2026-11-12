"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";

type Category = { slug: string; name: string; description: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [newName, setNewName] = useState("");
  const [created, setCreated] = useState<string[]>([]);

  useEffect(() => {
    api.categories.list().then(({ categories }: { categories: Category[] }) => {
      setCategories(categories);
      setVisibility(Object.fromEntries(categories.map((c) => [c.slug, true])));
      setLoaded(true);
    });
  }, []);

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
                    checked={!!visibility[c.slug]}
                    onChange={() => setVisibility((v) => ({ ...v, [c.slug]: !v[c.slug] }))}
                    label={`Toggle visibility for ${c.name}`}
                  />
                </td>
              </tr>
            ))}
            {created.map((name) => (
              <tr key={name} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{name}</td>
                <td className="px-4 py-3 text-text-muted">—</td>
                <td className="px-4 py-3 text-right text-success-text">New</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Create category</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName) { setCreated((c) => [...c, newName]); setNewName(""); }
          }}
          className="flex gap-3"
        >
          <Field id="new-category" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" className="flex-1" />
          <Button type="submit">Create</Button>
        </form>
      </div>
    </div>
  );
}
