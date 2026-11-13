import Link from "next/link";

const SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Core shopping",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop (all)", href: "/shop" },
      { label: "Shop — Home decor", href: "/shop/home-decor" },
      { label: "Shop — search", href: "/shop?q=vase" },
      { label: "Product — Spiral Decor Vase", href: "/products/spiral-decor-vase" },
      { label: "Product — out of stock (Hex Pen Cup)", href: "/products/hex-pen-cup" },
      { label: "Cart", href: "/cart" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Checkout",
    links: [
      { label: "Checkout — contact", href: "/checkout?step=contact" },
      { label: "Checkout — address", href: "/checkout?step=address" },
      { label: "Checkout — shipping", href: "/checkout?step=shipping" },
      { label: "Checkout — review", href: "/checkout?step=review" },
      { label: "Checkout — payment pending", href: "/checkout?step=pending" },
      { label: "Order success", href: "/order/success?order=HO-2026-10482" },
      { label: "Order failed", href: "/order/failed?order=HO-2026-10482" },
    ],
  },
  {
    title: "Custom Creations",
    links: [
      { label: "Custom Creations landing", href: "/custom-creations" },
      { label: "Request form", href: "/custom-creations/request" },
      { label: "Submitted", href: "/custom-creations/submitted/CC-2611-073801" },
      { label: "Track a request", href: "/custom-creations/track" },
    ],
  },
  {
    title: "Auth",
    links: [
      { label: "Login", href: "/login" },
      { label: "Login — session expired", href: "/login?expired=1" },
      { label: "Register", href: "/register" },
      { label: "Forgot password", href: "/forgot-password" },
      { label: "Forgot password — sent", href: "/forgot-password?sent=1" },
      { label: "Reset password", href: "/reset-password?token=demo" },
      { label: "Reset password — done", href: "/reset-password?done=1" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Account overview", href: "/account" },
      { label: "My orders", href: "/account/orders" },
      { label: "Order detail — HO-2026-10482", href: "/account/orders/HO-2026-10482" },
      { label: "Saved addresses", href: "/account/addresses" },
      { label: "Add address", href: "/account/addresses?edit=new" },
      { label: "Profile settings", href: "/account/profile" },
    ],
  },
  {
    title: "Tracking & info",
    links: [
      { label: "Track order", href: "/track-order?order=HO-2026-10482" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping policy", href: "/shipping-policy" },
      { label: "Return policy", href: "/return-policy" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
      { label: "404 page", href: "/404-demo" },
      { label: "Error page", href: "/error-demo" },
      { label: "Maintenance", href: "/maintenance" },
    ],
  },
  {
    title: "Admin",
    links: [
      { label: "Admin overview", href: "/admin" },
      { label: "Products", href: "/admin/products" },
      { label: "Add product", href: "/admin/products/new" },
      { label: "Edit product", href: "/admin/products/spiral-decor-vase/edit" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Orders", href: "/admin/orders" },
      { label: "Order detail", href: "/admin/orders/HO-2026-10482" },
      { label: "Production queue", href: "/admin/production" },
      { label: "Custom Creations", href: "/admin/custom-creations" },
      { label: "Custom Creation detail", href: "/admin/custom-creations/CC-2611-073801" },
      { label: "Customers", href: "/admin/customers" },
      { label: "Customer detail", href: "/admin/customers/cust-1" },
      { label: "Inventory", href: "/admin/inventory" },
      { label: "Inventory — low stock", href: "/admin/inventory?tab=low" },
      { label: "Inventory — history", href: "/admin/inventory?tab=history" },
      { label: "Coupons", href: "/admin/coupons" },
      { label: "New coupon", href: "/admin/coupons?new=1" },
      { label: "Payments", href: "/admin/payments" },
      { label: "Analytics", href: "/admin/analytics" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function PrototypeIndexPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Prototype route index</h1>
      <p className="mt-2 text-sm text-text-muted">Every route and state in this build, for review.</p>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-card bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">{section.title}</h2>
            <ul className="flex flex-col gap-1.5">
              {section.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-accent-text hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
