"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Heart, User, ShoppingCart, Menu, X, ChevronDown, Box } from "lucide-react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { api } from "@/lib/api";

type Category = { slug: string; name: string; description: string };
type Product = { slug: string; name: string; category: string; price: number; availability: string; isNew?: boolean };

export function Header() {
  const router = useRouter();
  const [catOpen, setCatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lines = useCart((s) => s.lines);
  const wishSlugs = useWishlist((s) => s.slugs);
  const cartCount = lines.reduce((n, l) => n + l.qty, 0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const catTriggerRef = useRef<HTMLButtonElement>(null);
  const catPanelRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!catOpen && !menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (catOpen) {
        setCatOpen(false);
        catTriggerRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [catOpen, menuOpen]);

  useEffect(() => {
    if (catOpen) catPanelRef.current?.querySelector("a")?.focus();
  }, [catOpen]);

  useEffect(() => {
    if (menuOpen) menuCloseRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    let active = true;
    Promise.all([api.categories.list(), api.products.list()])
      .then(([categoryResponse, productResponse]) => {
        if (!active) return;
        setCategories(categoryResponse.categories as Category[]);
        setProducts(productResponse.products as Product[]);
        setDataLoaded(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load shop data.");
      });

    return () => {
      active = false;
    };
  }, []);

  function categoryCount(slug: string) {
    return products.filter((p) => p.category === slug).length;
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  }

  if (!dataLoaded && !loadError) {
    return null;
  }

  if (loadError) {
    return (
      <div role="alert" className="border-b border-border bg-warning-tint px-4 py-3 text-center text-sm text-warning-text">
        Shop data could not be loaded: {loadError}
      </div>
    );
  }

  return (
    <>
      <div className="bg-dark py-2 text-center text-[13px] text-bg">
        Free standard shipping on orders above ₹1,499 · Every order printed in-house in India
      </div>
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="relative mx-auto flex flex-wrap items-center gap-6 px-4 py-1 sm:px-6" style={{ maxWidth: 1280 }}>
          <button
            ref={menuTriggerRef}
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" aria-label="HamzaOne home" className="flex items-center">
            <Image src="/HamzaOne_Logo.webp" alt="HamzaOne" width={72} height={72} priority className="h-14 w-14 object-contain md:h-18 md:w-18" />
          </Link>
          <nav aria-label="Primary" className="hidden flex-wrap items-center gap-1 md:flex">
            <Link href="/shop" className="rounded-full px-3 py-3 font-medium text-text hover:bg-black/5">
              Shop
            </Link>
            <div className="relative">
              <button
                ref={catTriggerRef}
                className="flex items-center gap-1 rounded-full px-3 py-3 font-medium text-text hover:bg-black/5"
                aria-expanded={catOpen}
                aria-haspopup="true"
                onClick={() => setCatOpen((v) => !v)}
              >
                Categories <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <Link href="/track-order" className="rounded-full px-3 py-3 font-medium text-text hover:bg-black/5">
              Track order
            </Link>
          </nav>

          <form
            role="search"
            onSubmit={submitSearch}
            className="flex h-11 min-w-[200px] flex-1 items-center gap-2 rounded-full border border-border-input bg-surface pl-4 pr-1.5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
            style={{ flexBasis: 240 }}
          >
            <label htmlFor="q" className="sr-only">Search products</label>
            <Search className="h-[18px] w-[18px] shrink-0 text-text-muted" strokeWidth={1.8} />
            <input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vases, stands, nameplates"
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none focus-visible:outline-none"
            />
            <button type="submit" className="rounded-full bg-dark px-3.5 py-2 text-xs font-semibold text-white">
              Search
            </button>
          </form>

          <Link href="/custom-print" className="hidden h-11 items-center justify-center rounded-full bg-accent px-[18px] text-[15px] font-semibold text-text hover:bg-accent-hover md:flex">
            Custom 3D Print
          </Link>

          <div className="flex gap-0.5">
            <Link href="/account" aria-label="Account" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5">
              <User className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </Link>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishSlugs.length} items`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
            >
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} items`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
            >
              <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.8} />
              <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-text">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {catOpen && (
          <div
            ref={catPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Categories"
            className="absolute left-0 right-0 top-full border-b border-border bg-surface shadow-md"
          >
            <div className="mx-auto grid grid-cols-2 gap-4 px-2 sm:px-4 sm:grid-cols-3 md:grid-cols-5" style={{ maxWidth: 1280 }}>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  onClick={() => setCatOpen(false)}
                  className="flex flex-col gap-1 rounded-input p-3 hover:bg-bg"
                >
                  <strong className="text-text">{c.name}</strong>
                  <span className="text-sm text-text-muted">{categoryCount(c.slug)} products</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {catOpen && (
        <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setCatOpen(false)} />
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Menu" className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-surface p-5 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <Image src="/HamzaOne_Logo.webp" alt="HamzaOne" width={40} height={40} className="h-10 w-10 object-contain" />
              <button ref={menuCloseRef} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <Link onClick={() => setMenuOpen(false)} href="/shop" className="rounded-chip px-3 py-3 text-sm font-semibold hover:bg:bg">
                All products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  onClick={() => setMenuOpen(false)}
                  href={`/shop/${c.slug}`}
                  className="rounded-chip px-3 py-3 text-sm hover:bg:bg"
                >
                  {c.name}
                </Link>
              ))}
              <Link onClick={() => setMenuOpen(false)} href="/custom-print" className="mt-2 flex items-center gap-2 rounded-chip bg-accent px-3 py-3 text-sm font-semibold text-text">
                <Box className="h-4 w-4" /> Custom 3D Print
              </Link>
              <Link onClick={() => setMenuOpen(false)} href="/track-order" className="rounded-chip px-3 py-3 text-sm hover:bg:bg">
                Track order
              </Link>
              <Link onClick={() => setMenuOpen(false)} href="/account" className="rounded-chip px-3 py-3 text-sm hover:bg:bg">
                Account &amp; wishlist
              </Link>
              <Link onClick={() => setMenuOpen(false)} href="/login" className="rounded-chip px-3 py-3 text-sm hover:bg:bg">
                Sign in
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
