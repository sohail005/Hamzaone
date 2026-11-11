const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://hamzaone.store").trim().replace(/\/$/, "");

async function apiFetch(path: string, init?: RequestInit) {
  if (!API_BASE) {
    throw new Error("API backend is not configured. Set NEXT_PUBLIC_API_URL to the real backend base URL.");
  }

  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      cache: typeof window === "undefined" ? "force-cache" : "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Could not reach API at ${API_BASE}${path}. Check network access and the API's CORS settings.`);
    }
    throw error;
  }

  if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}));
    const message =
      typeof err === "object" && err !== null && "error" in err && typeof err.error === "string"
        ? err.error
        : `API error ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  products: {
    list: async (params?: { category?: string; featured?: string }) => {
      const sp = new URLSearchParams();
      if (params?.category) sp.set("category", params.category);
      if (params?.featured) sp.set("featured", params.featured);
      return apiFetch(`/api/products?${sp.toString()}`);
    },
    get: async (slug: string) => {
      return apiFetch(`/api/products/${encodeURIComponent(slug)}`);
    },
  },
  categories: {
    list: async () => {
      return apiFetch("/api/categories");
    },
    get: async (slug: string) => {
      return apiFetch(`/api/categories?slug=${encodeURIComponent(slug)}`);
    },
  },
  orders: {
    list: async (params?: { id?: string; status?: string; paymentStatus?: string }) => {
      const sp = new URLSearchParams();
      if (params?.id) sp.set("id", params.id);
      if (params?.status) sp.set("status", params.status);
      if (params?.paymentStatus) sp.set("paymentStatus", params.paymentStatus);
      return apiFetch(`/api/orders?${sp.toString()}`);
    },
    get: async (id: string) => {
      return apiFetch(`/api/orders/${encodeURIComponent(id)}`);
    },
    create: async (body: unknown) => {
      return apiFetch("/api/orders", { method: "POST", body: JSON.stringify(body) });
    },
  },
  admin: {
    list: async (resource?: string) => {
      const sp = new URLSearchParams();
      if (resource) sp.set("resource", resource);
      return apiFetch(`/api/admin?${sp.toString()}`);
    },
  },
  home: {
    list: async (section?: string) => {
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/home?${sp.toString()}`);
    },
  },
  customPrint: {
    list: async (section?: string) => {
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/custom-print?${sp.toString()}`);
    },
  },
};
