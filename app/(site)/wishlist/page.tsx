import type { Metadata } from "next";
import { fetchProducts } from "@/lib/server/catalog";
import { WishlistView } from "@/components/WishlistView";

export const revalidate = 60;
export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const products = await fetchProducts();
  return <WishlistView products={products} />;
}
