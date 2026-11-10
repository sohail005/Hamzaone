const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch(path: string, init?: RequestInit) {
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
    list: (params?: { category?: string; featured?: string }) => {
      const sp = new URLSearchParams();
      if (params?.category) sp.set("category", params.category);
      if (params?.featured) sp.set("featured", params.featured);
      return apiFetch(`/api/products?${sp.toString()}`);
    },
    get: (slug: string) => apiFetch(`/api/products/${encodeURIComponent(slug)}`),
  },
  categories: {
    list: () => apiFetch("/api/categories"),
    get: (slug: string) => apiFetch(`/api/categories?slug=${encodeURIComponent(slug)}`),
  },
  orders: {
    list: (params?: { id?: string; status?: string; paymentStatus?: string }) => {
      const sp = new URLSearchParams();
      if (params?.id) sp.set("id", params.id);
      if (params?.status) sp.set("status", params.status);
      if (params?.paymentStatus) sp.set("paymentStatus", params.paymentStatus);
      return apiFetch(`/api/orders?${sp.toString()}`);
    },
    get: (id: string) => apiFetch(`/api/orders/${encodeURIComponent(id)}`),
    create: (body: unknown) =>
      apiFetch("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  },
  admin: {
    list: (resource?: string) => {
      const sp = new URLSearchParams();
      if (resource) sp.set("resource", resource);
      return apiFetch(`/api/admin?${sp.toString()}`);
    },
  },
  home: {
    list: (section?: string) => {
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/home?${sp.toString()}`);
    },
  },
  customPrint: {
    list: (section?: string) => {
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/custom-print?${sp.toString()}`);
    },
  },
};
