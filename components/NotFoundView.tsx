"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "./Button";

export function NotFoundView() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="font-display text-6xl font-extrabold text-accent-text">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-text-muted">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/shop?q=${encodeURIComponent(q)}`);
        }}
        className="flex w-full max-w-sm gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="h-11 w-full rounded-full border border-border-input bg-surface pl-9 pr-4 text-sm"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      <div className="flex gap-3">
        <Link href="/"><Button variant="outline">Go to home</Button></Link>
        <Link href="/shop"><Button variant="ghost">Browse shop</Button></Link>
      </div>
    </div>
  );
}
