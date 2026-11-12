import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ProductDetail } from "@/components/ProductDetail";
import type { Product } from "@/data/products";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamzaone.pages.dev").trim().replace(/\/$/, "");

async function getProduct(slug: string): Promise<Product | null> {
  const { product } = await api.products.get(slug).catch(() => ({ product: null }));
  return product ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const title = product.name;
  const description = product.description;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/products/${product.slug}`, type: "website" },
    twitter: { title, description },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        product.availability === "out-of-stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/products/${product.slug}` },
    ],
  };

  return (
    <Suspense>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductDetail product={product} />
    </Suspense>
  );
}
