import type { Metadata } from "next";
import { api } from "@/lib/api";
import { WishlistView } from "@/components/WishlistView";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const { products } = await api.products.list();
  return <WishlistView products={products} />;
}
