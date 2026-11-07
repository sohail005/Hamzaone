"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cx } from "@/lib/format";
import { Button } from "./Button";

const ITEMS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/addresses", label: "Saved addresses" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account/profile", label: "Profile settings" },
];

export function AccountSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <nav className="flex flex-col gap-1 rounded-card bg-surface p-3 shadow-sm">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx("rounded-chip px-3 py-2.5 text-sm font-medium", active ? "bg-mto-chip-bg text-accent-text" : "text-text hover:bg-bg")}
            >
              {item.label}
            </Link>
          );
        })}
        <button onClick={() => setConfirmOpen(true)} className="rounded-chip px-3 py-2.5 text-left text-sm font-medium text-error-text hover:bg-bg">
          Log out
        </button>
      </nav>

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">Log out?</h3>
            <p className="mt-2 text-sm text-text-muted">You&apos;ll need to sign in again to access your account.</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => router.push("/")}>Log out</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
