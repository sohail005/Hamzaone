import type { Metadata } from "next";
import { fetchProducts } from "@/lib/server/catalog";
import { WishlistView } from "@/components/WishlistView";

// See app/(site)/shop/page.tsx — ISR doesn't reliably refresh on this build.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const products = await fetchProducts();
  return <WishlistView products={products} />;
}
