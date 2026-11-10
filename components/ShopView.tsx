"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductCard } from "./ProductCard";
import { Button } from "./Button";
import { cx } from "@/lib/format";
import { api } from "@/lib/api";

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price low to high" },
  { key: "price-desc", label: "Price high to low" },
];

const PRICE_BANDS = [
  { key: "under-300", label: "Under ₹300", test: (p: number) => p < 300 },
  { key: "300-700", label: "₹300 – ₹700", test: (p: number) => p >= 300 && p <= 700 },
  { key: "over-700", label: "Over ₹700", test: (p: number) => p > 700 },
];

const AVAILABILITY: { key: string; label: string }[] = [
  { key: "available", label: "In stock" },
  { key: "made-to-order", label: "Made to order" },
  { key: "low-stock", label: "Low stock" },
  { key: "out-of-stock", label: "Out of stock" },
];

const MATERIALS = ["PLA", "PETG", "TPU"];

export function ShopView({ categorySlug }: { categorySlug?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [mobileSort, setMobileSort] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [settledKey, setSettledKey] = useState<string | null>(null);

  const category = categorySlug ?? params.get("category") ?? "";
  const avail = params.get("avail") ?? "";
  const price = params.get("price") ?? "";
  const material = params.get("material") ?? "";
  const sort = params.get("sort") ?? "featured";
  const q = params.get("q") ?? "";
  const page = parseInt(params.get("page") ?? "1", 10);

  const filterKey = [category, avail, price, material, sort, q].join("|");
  useEffect(() => {
    const t = setTimeout(() => setSettledKey(filterKey), 450);
    return () => clearTimeout(t);
  }, [filterKey]);
  const showLoading = loading || settledKey !== filterKey;

  const filtered = useMemo(() => {
    let list = products.slice();
    if (category) list = list.filter((p) => p.category === category);
    if (avail) list = list.filter((p) => p.availability === avail);
    if (material) list = list.filter((p) => p.material === material);
    if (price) {
      const band = PRICE_BANDS.find((b) => b.key === price);
      if (band) list = list.filter((p) => band.test(p.price));
    }
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

    if (sort === "newest") list = list.filter((p) => p.isNew).concat(list.filter((p) => !p.isNew));
    else if (sort === "price-asc") list = list.slice().sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);

    return list;
  }, [products, category, avail, price, material, sort, q]);

  useEffect(() => {
    let loaded = 0;
    const total = 2;
    api.products.list().then(({ products }: { products: Product[] }) => {
      setProducts(products);
      loaded++;
      if (loaded === total) setDataLoaded(true);
    });
    api.categories.list().then(({ categories }: { categories: Category[] }) => {
      setCategories(categories);
      loaded++;
      if (loaded === total) setDataLoaded(true);
    });
  }, []);

  if (!dataLoaded) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    setLoading(true);
    router.replace(`${categorySlug ? `/shop/${categorySlug}` : "/shop"}?${sp.toString()}`);
    setTimeout(() => setLoading(false), 450);
  }

  const visibleCount = Math.min(page * 12, filtered.length);
  const visible = filtered.slice(0, visibleCount);
  const activeChips = [
    category && { key: "category", label: categories.find((c) => c.slug === category)?.name ?? category },
    avail && { key: "avail", label: AVAILABILITY.find((a) => a.key === avail)?.label ?? avail },
    price && { key: "price", label: PRICE_BANDS.find((b) => b.key === price)?.label ?? price },
    material && { key: "material", label: material },
  ].filter(Boolean) as { key: string; label: string }[];

  function resetAll() {
    setLoading(true);
    router.replace(categorySlug ? `/shop/${categorySlug}` : "/shop");
    setTimeout(() => setLoading(false), 450);
  }

  const catName = category ? categories.find((c) => c.slug === category)?.name : "All products";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: categorySlug ? "/shop" : undefined },
          ...(categorySlug ? [{ label: catName ?? categorySlug }] : []),
        ]}
      />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">{catName}</h1>
          <p className="text-sm text-text-muted">{filtered.length} products</p>
        </div>
        <div className="hidden items-center gap-1 rounded-full border border-border-input p-1 md:flex">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => update({ sort: s.key === "featured" ? null : s.key, page: null })}
              className={cx(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                sort === s.key ? "bg-dark text-white" : "text-text-muted hover:text-text"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 md:hidden">
          <Button variant="outline" size="sm" onClick={() => setMobileFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMobileSort(true)}>
            Sort
          </Button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button
              key={c.key}
              onClick={() => update({ [c.key]: null, page: null })}
              className="flex items-center gap-1 rounded-chip bg-neutral-chip-bg px-3 py-1.5 text-xs font-medium text-neutral-chip-text"
            >
              {c.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button onClick={resetAll} className="text-xs font-semibold text-accent-text">
            Reset all
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <FilterPanel
            category={category}
            avail={avail}
            price={price}
            material={material}
            onChange={update}
            showCategory={!categorySlug}
            categories={categories}
          />
        </aside>

        <div>
          {showLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-card bg-surface" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-card bg-surface py-16 text-center">
              <p className="text-lg font-semibold">No products match these filters</p>
              <p className="text-sm text-text-muted">Try resetting your filters or search.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetAll}>Reset filters</Button>
                <a href="/custom-print"><Button>Request a custom print</Button></a>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {visible.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-sm text-text-muted">
                  Showing {visible.length} of {filtered.length}
                </p>
                {visible.length < filtered.length && (
                  <Button variant="outline" onClick={() => update({ page: String(page + 1) })}>
                    Load more
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-sheet bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            <FilterPanel
              category={category}
              avail={avail}
              price={price}
              material={material}
              onChange={update}
              showCategory={!categorySlug}
              categories={categories}
            />
            <Button className="mt-4 w-full" onClick={() => setMobileFilters(false)}>Show results</Button>
          </div>
        </div>
      )}

      {mobileSort && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSort(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-sheet bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Sort</h3>
              <button onClick={() => setMobileSort(false)} aria-label="Close sort"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-1">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    update({ sort: s.key === "featured" ? null : s.key, page: null });
                    setMobileSort(false);
                  }}
                  className={cx("rounded-chip px-3 py-3 text-left text-sm font-medium", sort === s.key ? "bg-bg" : "")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  category,
  avail,
  price,
  material,
  onChange,
  showCategory,
  categories,
}: {
  category: string;
  avail: string;
  price: string;
  material: string;
  onChange: (next: Record<string, string | null>) => void;
  showCategory: boolean;
  categories: Category[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {showCategory && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Category</h4>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <label key={c.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="category"
                  checked={category === c.slug}
                  onChange={() => onChange({ category: c.slug, page: null })}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <h4 className="mb-2 text-sm font-semibold">Availability</h4>
        <div className="flex flex-col gap-2">
          {AVAILABILITY.map((a) => (
            <label key={a.key} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="avail"
                checked={avail === a.key}
                onChange={() => onChange({ avail: a.key, page: null })}
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Price</h4>
        <div className="flex flex-col gap-2">
          {PRICE_BANDS.map((b) => (
            <label key={b.key} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="price"
                checked={price === b.key}
                onChange={() => onChange({ price: b.key, page: null })}
              />
              {b.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Material</h4>
        <div className="flex flex-col gap-2">
          {MATERIALS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="material"
                checked={material === m}
                onChange={() => onChange({ material: m, page: null })}
              />
              {m}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
