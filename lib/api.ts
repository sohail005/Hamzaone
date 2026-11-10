import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { orders, findOrder } from "@/data/orders";
import {
  customers,
  coupons,
  payments,
  productionCards,
  inventory,
  customRequests,
} from "@/data/admin";
import {
  featuredProducts,
  newArrivals,
  customSteps,
  howItWorks,
  valueProps,
  homeReviews,
  homeFaqs,
  heroChecklist,
  categoryShapes,
} from "@/data/home";
import { quote, materials, faqs, testimonials } from "@/data/customPrint";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const DEMO_API_BASES = new Set([
  "https://hamzaone.store",
  "https://www.hamzaone.store",
  "https://hamzaone.pages.dev",
  "https://www.hamzaone.pages.dev",
]);

const API_BASE = (() => {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (!value) return "";
  return DEMO_API_BASES.has(value) ? "" : value;
})();

const shouldUseMockData = isBuild || !API_BASE;

async function apiFetch(path: string, init?: RequestInit) {
  if (!API_BASE) {
    throw new Error("API backend is not configured for this front-end-only demo.");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  products: {
    list: async (params?: { category?: string; featured?: string }) => {
      if (shouldUseMockData) {
        let result = products;
        if (params?.category) result = result.filter((p) => p.category === params.category);
        if (params?.featured === "true") result = result.filter((p) => p.isNew === true || p.availability === "low-stock");
        return { products: result, count: result.length };
      }
      const sp = new URLSearchParams();
      if (params?.category) sp.set("category", params.category);
      if (params?.featured) sp.set("featured", params.featured);
      return apiFetch(`/api/products?${sp.toString()}`);
    },
    get: async (slug: string) => {
      if (shouldUseMockData) {
        const product = products.find((p) => p.slug === slug);
        return { product };
      }
      return apiFetch(`/api/products/${encodeURIComponent(slug)}`);
    },
  },
  categories: {
    list: async () => {
      if (shouldUseMockData) return { categories, count: categories.length };
      return apiFetch("/api/categories");
    },
    get: async (slug: string) => {
      if (shouldUseMockData) {
        const category = categories.find((c) => c.slug === slug);
        return { category };
      }
      return apiFetch(`/api/categories?slug=${encodeURIComponent(slug)}`);
    },
  },
  orders: {
    list: async (params?: { id?: string; status?: string; paymentStatus?: string }) => {
      if (shouldUseMockData) {
        let result = orders;
        if (params?.id) {
          const order = findOrder(params.id);
          return order ? { order } : { error: "Order not found" };
        }
        if (params?.status) result = result.filter((o) => o.status === params.status);
        if (params?.paymentStatus) result = result.filter((o) => o.paymentStatus === params.paymentStatus);
        return { orders: result, count: result.length };
      }
      const sp = new URLSearchParams();
      if (params?.id) sp.set("id", params.id);
      if (params?.status) sp.set("status", params.status);
      if (params?.paymentStatus) sp.set("paymentStatus", params.paymentStatus);
      return apiFetch(`/api/orders?${sp.toString()}`);
    },
    get: async (id: string) => {
      if (shouldUseMockData) {
        const order = findOrder(id);
        return { order };
      }
      return apiFetch(`/api/orders/${encodeURIComponent(id)}`);
    },
    create: async (body: unknown) => {
      if (shouldUseMockData) return { message: "Order received", order: body };
      return apiFetch("/api/orders", { method: "POST", body: JSON.stringify(body) });
    },
  },
  admin: {
    list: async (resource?: string) => {
      if (shouldUseMockData) {
        if (resource === "all") {
          return {
            customers,
            coupons,
            payments,
            production: productionCards,
            inventory,
            customRequests: customRequests,
          };
        }
        const map: Record<string, unknown> = {
          customers,
          coupons,
          payments,
          production: productionCards,
          inventory,
          "custom-requests": customRequests,
        };
        const key = Object.keys(map).find((k) => k.toLowerCase() === resource?.toLowerCase());
        return key ? { [key]: map[key] } : { error: "Unknown resource" };
      }
      const sp = new URLSearchParams();
      if (resource) sp.set("resource", resource);
      return apiFetch(`/api/admin?${sp.toString()}`);
    },
  },
  home: {
    list: async (section?: string) => {
      if (shouldUseMockData) {
        const sections: Record<string, unknown> = {
          featured: featuredProducts,
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
          const key = Object.keys(sections).find((k) => k === section);
          return key ? { [key]: sections[key] } : { error: "Unknown section" };
        }
        return {
          featured: featuredProducts,
          newArrivals: newArrivals,
          customSteps,
          howItWorks,
          valueProps,
          homeReviews,
          homeFaqs,
          heroChecklist,
          categoryShapes,
        };
      }
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/home?${sp.toString()}`);
    },
  },
  customPrint: {
    list: async (section?: string) => {
      if (shouldUseMockData) {
        const sections: Record<string, unknown> = {
          quote,
          materials,
          faqs,
          testimonials,
        };
        if (section) {
          const key = Object.keys(sections).find((k) => k === section);
          return key ? { [key]: sections[key] } : { error: "Unknown section" };
        }
        return { quote, materials, faqs, testimonials };
      }
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/custom-print?${sp.toString()}`);
    },
  },
};
