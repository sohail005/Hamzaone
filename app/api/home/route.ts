import {
  customSteps,
  howItWorks,
  valueProps,
  homeReviews,
  homeFaqs,
  heroChecklist,
  categoryShapes,
  type HomeCard,
} from "@/data/home";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { listProducts } from "@/lib/server/products-store";
import type { Product } from "@/data/products";

function toHomeCard(product: Product, index: number): HomeCard {
  const badge: HomeCard["badge"] = product.isNew
    ? "new"
    : product.availability === "low-stock"
      ? "low-stock"
      : product.availability === "made-to-order"
        ? "made-to-order"
        : "available";

  return {
    id: index + 1,
    slug: product.slug,
    name: product.name,
    meta: `${product.material} · ${product.colors.length} colour${product.colors.length === 1 ? "" : "s"}`,
    price: product.price,
    shape: product.shape,
    color: product.colors[0]?.hex ?? "#8C8F96",
    badge,
    availability: product.availability,
  };
}

export async function getFeaturedAndNewArrivals() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  if (!kv) return { featured: [], newArrivals: [] };

  const allProducts = await listProducts(kv);

  const highlighted = allProducts.filter((p) => p.isNew || p.availability === "low-stock");
  const rest = allProducts.filter((p) => !highlighted.includes(p));
  const featured = [...highlighted, ...rest].slice(0, 4).map(toHomeCard);

  // Index order reflects insertion order (newest products are appended last).
  const newArrivals = [...allProducts].reverse().slice(0, 4).map(toHomeCard);

  return { featured, newArrivals };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  const headers = { "Cache-Control": "no-store" };
  const { featured, newArrivals } = await getFeaturedAndNewArrivals();

  const sections: Record<string, unknown> = {
    featured,
    "new-arrivals": newArrivals,
    "custom-steps": customSteps,
    "how-it-works": howItWorks,
    "value-props": valueProps,
    "home-reviews": homeReviews,
    "home-faqs": homeFaqs,
    "hero-checklist": heroChecklist,
    "category-shapes": categoryShapes,
  };

  if (section) {
    if (!(section in sections)) {
      return Response.json({ error: "Unknown section" }, { status: 400 });
    }
    return Response.json({ [section]: sections[section] }, { headers });
  }

  return Response.json(
    {
      featured,
      newArrivals,
      customSteps,
      howItWorks,
      valueProps,
      homeReviews,
      homeFaqs,
      heroChecklist,
      categoryShapes,
    },
    { headers },
  );
}
