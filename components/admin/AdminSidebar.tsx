"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Factory, FileText,
  Users, Boxes, Ticket, CreditCard, BarChart3, Settings, ChevronsLeft, ChevronsRight, ExternalLink,
} from "lucide-react";
import { cx } from "@/lib/format";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/production", label: "Production Queue", icon: Factory },
  { href: "/admin/custom-requests", label: "Custom Requests", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      className={cx(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-surface transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <Link href="/admin" className="flex h-16 items-center gap-2 border-b border-border px-4">
        <span className="font-display text-lg font-extrabold text-text">{collapsed ? "H1" : "HamzaOne"}</span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "mb-1 flex items-center gap-3 rounded-chip px-3 py-2.5 text-sm font-medium",
                active ? "bg-mto-chip-bg text-accent-text" : "text-text hover:bg-bg"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-2">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-chip px-3 py-2.5 text-sm font-medium text-text hover:bg-bg">
          <ExternalLink className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>View store</span>}
        </a>
        <button onClick={onToggle} className="flex items-center gap-3 rounded-chip px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-bg">
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
