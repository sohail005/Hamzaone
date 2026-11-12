"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Package, Heart, MapPin, Settings, LogOut, Pencil, Sparkles } from "lucide-react";
import { cx } from "@/lib/format";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

const ITEMS = [
  { href: "/account", label: "My Account", icon: Home },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/wishlist", label: "My Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile Settings", icon: Settings },
];

export function AccountSideNav({ name, email, avatarUrl }: { name: string; email: string; avatarUrl?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/me", { method: "DELETE", credentials: "include" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      <div className="relative mb-3 flex flex-col items-center gap-2 overflow-hidden rounded-card bg-gradient-to-br from-accent to-accent-hover p-5 text-center text-white shadow-sm">
        <Link
          href="/account/profile"
          aria-label="Edit profile"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        <Avatar name={name} src={avatarUrl} size={64} className="ring-2 ring-white/60" />
        <p className="truncate text-sm font-bold">{name}</p>
        <p className="truncate text-xs text-white/80">{email}</p>
      </div>

      <nav className="flex flex-col gap-1 rounded-card bg-surface p-3 shadow-sm">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 rounded-chip px-3 py-2.5 text-sm font-medium",
                active ? "bg-mto-chip-bg text-accent-text" : "text-text hover:bg-bg",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-3 rounded-chip px-3 py-2.5 text-left text-sm font-medium text-error-text hover:bg-bg"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </nav>

      <div className="relative mt-3 overflow-hidden rounded-card bg-dark p-5 text-white">
        <Sparkles className="h-5 w-5 text-accent" />
        <p className="mt-3 text-sm font-bold leading-snug">
          Create More <br /> With <span className="text-accent">HamzaOne</span>
        </p>
        <Link
          href="/shop"
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-text hover:bg-accent-hover"
        >
          Shop Now →
        </Link>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-panel bg-surface p-6 shadow-lg">
            <h3 className="text-lg font-bold">Log out?</h3>
            <p className="mt-2 text-sm text-text-muted">You&apos;ll need to sign in again to access your account.</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" loading={loggingOut} onClick={logout}>Log out</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
