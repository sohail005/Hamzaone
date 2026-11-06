"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const ITEMS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-policy", label: "Shipping policy" },
  { href: "/return-policy", label: "Returns and refunds" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms and conditions" },
];

const DEMO_ITEMS = [
  { href: "/404-demo", label: "404 page" },
  { href: "/error-demo", label: "Generic error" },
  { href: "/maintenance", label: "Maintenance" },
];

export function InfoSideNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 rounded-card bg-surface p-3 shadow-sm">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={cx("rounded-chip px-3 py-2.5 text-sm font-medium", pathname === item.href ? "bg-mto-chip-bg text-accent-text" : "text-text hover:bg-bg")}
        >
          {item.label}
        </Link>
      ))}
      <div className="my-2 border-t border-border" />
      <p className="px-3 text-xs font-semibold uppercase text-text-muted">Demo routes</p>
      {DEMO_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-chip px-3 py-2.5 text-sm text-text-muted hover:bg-bg">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
