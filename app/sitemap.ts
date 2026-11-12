import type { MetadataRoute } from "next";
import { api } from "@/lib/api";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamzaone.pages.dev").trim().replace(/\/$/, "");

const STATIC_ROUTES = [
  "",
  "/shop",
  "/custom-print",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy-policy",
  "/return-policy",
  "/shipping-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, { categories }] = await Promise.all([
    api.products.list().catch(() => ({ products: [] as Array<{ slug: string }> })),
    api.categories.list().catch(() => ({ categories: [] as Array<{ slug: string }> })),
  ]);

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
  }));

  const categoryEntries = categories.map((c: { slug: string }) => ({
    url: `${SITE_URL}/shop/${c.slug}`,
    changeFrequency: "weekly" as const,
  }));

  const productEntries = products.map((p: { slug: string }) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    changeFrequency: "daily" as const,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
