const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://hamzaone.store").trim().replace(/\/$/, "");

type FetchStrategy = "revalidate" | "fresh";

async function apiFetch(path: string, init?: RequestInit, strategy: FetchStrategy = "fresh", tags?: string[]) {
  if (!API_BASE) {
    throw new Error("API origin is not configured. Set NEXT_PUBLIC_API_URL to this app's origin (see .env.example).");
  }

  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // A server-side fetch to our own co-located /api routes is a fresh outgoing
  // request — it doesn't automatically carry the browser's cookies the way a
  // same-origin browser fetch does, so the session cookie has to be forwarded
  // by hand for auth-gated endpoints (admin/orders listings, etc.). This also
  // means every server-rendered page that calls api.* ends up request-scoped
  // (Next treats any cookies() read as a dynamic signal) rather than
  // statically prerendered — expected here, since the data source is this
  // same app's own routes, which aren't reachable yet during its own build.
  // The Cache-Control headers set on the /api/* routes still let an edge/CDN
  // layer cache the underlying data fetch even though the page render itself
  // is per-request.
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const cookieHeader = store.toString();
    if (cookieHeader) headers.set("Cookie", cookieHeader);
  }

  const isRevalidatable = typeof window === "undefined" && strategy === "revalidate";
  const isIdempotent = !init?.method || init.method === "GET";

  // Server-side requests hit this app's own public hostname, which round-trips
  // through Cloudflare's edge back to this same Worker. That extra hop
  // occasionally times out with a transient 522 even though nothing is
  // actually down (confirmed: same endpoint succeeds on the very next
  // request). Retry idempotent requests once before surfacing an error.
  const maxAttempts = isIdempotent ? 3 : 1;

  let res: Response | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
        credentials: "include",
        cache: isRevalidatable ? undefined : "no-store",
        next: isRevalidatable ? { revalidate: 60, tags } : undefined,
      });
    } catch (error) {
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
        continue;
      }
      if (error instanceof TypeError) {
        throw new Error(`Could not reach API at ${API_BASE}${path}. Check network access and the API's CORS settings.`);
      }
      throw error;
    }

    const isTransientEdgeError = res.status === 522 || res.status === 521 || res.status === 524;
    if (isTransientEdgeError && attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
      continue;
    }
    break;
  }

  const finalRes = res!;
  if (!finalRes.ok) {
    const err: unknown = await finalRes.json().catch(() => ({}));
    const message =
      typeof err === "object" && err !== null && "error" in err && typeof err.error === "string"
        ? err.error
        : `API error ${finalRes.status}`;
    throw new Error(message);
  }
  return finalRes.json();
}

export const api = {
  products: {
    // Public catalog data — short revalidation window is fine.
    list: async (params?: { category?: string; featured?: string }) => {
      const sp = new URLSearchParams();
      if (params?.category) sp.set("category", params.category);
      if (params?.featured) sp.set("featured", params.featured);
      return apiFetch(`/api/products?${sp.toString()}`, undefined, "revalidate", ["products"]);
    },
    get: async (slug: string) => {
      return apiFetch(`/api/products/${encodeURIComponent(slug)}`, undefined, "revalidate", ["products", `product:${slug}`]);
    },
    create: async (body: unknown) => {
      return apiFetch("/api/products", { method: "POST", body: JSON.stringify(body) });
    },
    update: async (slug: string, patch: unknown) => {
      return apiFetch(`/api/products/${encodeURIComponent(slug)}`, { method: "PATCH", body: JSON.stringify(patch) });
    },
    remove: async (slug: string) => {
      return apiFetch(`/api/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
    },
  },
  categories: {
    list: async () => {
      return apiFetch("/api/categories", undefined, "revalidate");
    },
    listAll: async () => {
      return apiFetch("/api/categories?all=true");
    },
    get: async (slug: string) => {
      return apiFetch(`/api/categories?slug=${encodeURIComponent(slug)}`, undefined, "revalidate");
    },
    create: async (body: unknown) => {
      return apiFetch("/api/categories", { method: "POST", body: JSON.stringify(body) });
    },
    update: async (slug: string, patch: unknown) => {
      return apiFetch(`/api/categories?slug=${encodeURIComponent(slug)}`, { method: "PATCH", body: JSON.stringify(patch) });
    },
  },
  orders: {
    // Order/account data must always be fresh and user-specific — never cached.
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
    update: async (id: string, patch: { status?: string; trackingNumber?: string | null; carrier?: string | null }) => {
      return apiFetch(`/api/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    },
    recheckPayment: async (id: string) => {
      return apiFetch(`/api/admin/orders/${encodeURIComponent(id)}/recheck-payment`, { method: "POST" });
    },
  },
  admin: {
    list: async (resource?: string) => {
      const sp = new URLSearchParams();
      if (resource) sp.set("resource", resource);
      return apiFetch(`/api/admin?${sp.toString()}`);
    },
    uploadAsset: async (file: File, folder: "categories" | "hero" | "custom-creation-categories" | "products"): Promise<{ storageKey: string; mimeType: string }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/api/admin/assets/upload?folder=${folder}`);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("X-Original-Name", encodeURIComponent(file.name));
        xhr.setRequestHeader("X-Original-Size", String(file.size));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Could not parse upload response."));
            }
          } else {
            try {
              reject(new Error(JSON.parse(xhr.responseText)?.error ?? "Upload failed."));
            } catch {
              reject(new Error("Upload failed."));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed due to a network error."));
        xhr.send(file);
      });
    },
  },
  adminUsers: {
    list: async (): Promise<{ admins: Array<{ id: string; name: string; email: string; createdAt: string }> }> => {
      return apiFetch("/api/admin/users");
    },
    create: async (body: { name: string; email: string; password: string }) => {
      return apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
    },
  },
  storeSettings: {
    get: async (): Promise<{ settings: { storeName?: string; supportEmail?: string; accentColor?: string; standardShipping?: number; expressShipping?: number; freeShippingThreshold?: number } }> => {
      return apiFetch("/api/admin/store-settings");
    },
    update: async (patch: Partial<{ storeName: string; supportEmail: string; accentColor: string; standardShipping: number; expressShipping: number; freeShippingThreshold: number }>) => {
      return apiFetch("/api/admin/store-settings", { method: "PATCH", body: JSON.stringify(patch) });
    },
  },
  homeSettings: {
    get: async (): Promise<{ settings: { heroImageKeys?: string[] } }> => {
      return apiFetch("/api/admin/home-settings");
    },
    update: async (patch: { heroImageKeys: string[] }) => {
      return apiFetch("/api/admin/home-settings", { method: "PATCH", body: JSON.stringify(patch) });
    },
  },
  coupons: {
    // Throws (apiFetch) with the server's error message (e.g. "Invalid coupon
    // code.") on an invalid/expired/under-minimum coupon.
    validate: async (code: string, subtotal: number): Promise<{ valid: true; couponCode: string; discount: number }> => {
      return apiFetch("/api/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) });
    },
    create: async (body: { code: string; type: "flat" | "percent"; value: number; minOrder: number; expires?: string; maxUses?: number }) => {
      return apiFetch("/api/admin/coupons", { method: "POST", body: JSON.stringify(body) });
    },
    update: async (code: string, patch: Partial<{ type: "flat" | "percent"; value: number; minOrder: number; expires: string; enabled: boolean; maxUses: number }>) => {
      return apiFetch("/api/admin/coupons", { method: "PATCH", body: JSON.stringify({ code, ...patch }) });
    },
  },
  reviews: {
    list: async (productSlug?: string) => {
      const sp = new URLSearchParams();
      if (productSlug) sp.set("productSlug", productSlug);
      return apiFetch(`/api/reviews?${sp.toString()}`, undefined, "revalidate");
    },
    create: async (body: { orderId: string; email: string; productSlug: string; rating: number; quote: string }) => {
      return apiFetch("/api/reviews", { method: "POST", body: JSON.stringify(body) });
    },
    adminList: async () => apiFetch("/api/admin/reviews"),
    adminSetApproved: async (id: string, approved: boolean) => {
      return apiFetch("/api/admin/reviews", { method: "PATCH", body: JSON.stringify({ id, approved }) });
    },
    adminDelete: async (id: string) => apiFetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  inventory: {
    adjustStock: async (slug: string, variant: string, stock: number) => {
      return apiFetch("/api/admin/inventory", { method: "PATCH", body: JSON.stringify({ slug, variant, stock }) });
    },
  },
  production: {
    updateStage: async (id: string, stage: string) => {
      return apiFetch("/api/admin/production", { method: "PATCH", body: JSON.stringify({ id, stage }) });
    },
  },
  customCreationCategories: {
    get: async (): Promise<{ overrides: Record<string, { imageKey?: string; enabled?: boolean }> }> => {
      return apiFetch("/api/admin/custom-creation-categories");
    },
    update: async (slug: string, patch: { imageKey?: string | null; enabled?: boolean }) => {
      return apiFetch("/api/admin/custom-creation-categories", { method: "PATCH", body: JSON.stringify({ slug, ...patch }) });
    },
  },
  home: {
    list: async (section?: string) => {
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/home?${sp.toString()}`, undefined, "revalidate");
    },
  },
  customCreations: {
    create: async (body: unknown) => {
      return apiFetch("/api/custom-creations", { method: "POST", body: JSON.stringify(body) });
    },
    upload: async (
      file: File,
      onProgress?: (pct: number) => void,
    ): Promise<{ storageKey: string; originalFilename: string; mimeType: string; fileSize: number }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/api/custom-creations/upload`);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("X-Original-Name", encodeURIComponent(file.name));
        xhr.setRequestHeader("X-Original-Size", String(file.size));

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Could not parse upload response."));
            }
          } else {
            try {
              reject(new Error(JSON.parse(xhr.responseText)?.error ?? "Upload failed."));
            } catch {
              reject(new Error("Upload failed."));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed due to a network error."));
        xhr.send(file);
      });
    },
    track: async (requestNumber: string, params: { email?: string; token?: string }) => {
      const sp = new URLSearchParams();
      if (params.email) sp.set("email", params.email);
      if (params.token) sp.set("token", params.token);
      return apiFetch(`/api/custom-creations/${encodeURIComponent(requestNumber)}?${sp.toString()}`);
    },
    quotation: {
      get: async (secureToken: string) => apiFetch(`/api/custom-creations/quotation/${encodeURIComponent(secureToken)}`),
      accept: async (secureToken: string) => apiFetch(`/api/custom-creations/quotation/${encodeURIComponent(secureToken)}/accept`, { method: "POST" }),
      decline: async (secureToken: string) => apiFetch(`/api/custom-creations/quotation/${encodeURIComponent(secureToken)}/decline`, { method: "POST" }),
      pay: async (secureToken: string) => apiFetch(`/api/custom-creations/quotation/${encodeURIComponent(secureToken)}/pay`, { method: "POST" }),
    },
    adminList: async (params?: { status?: string; search?: string; page?: number }) => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set("status", params.status);
      if (params?.search) sp.set("search", params.search);
      if (params?.page) sp.set("page", String(params.page));
      return apiFetch(`/api/admin/custom-creations?${sp.toString()}`);
    },
    adminGet: async (id: string) => apiFetch(`/api/admin/custom-creations/${encodeURIComponent(id)}`),
    adminUpdateStatus: async (id: string, status: string, note?: string) =>
      apiFetch(`/api/admin/custom-creations/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),
    adminUpdateNotes: async (id: string, notes: string) =>
      apiFetch(`/api/admin/custom-creations/${encodeURIComponent(id)}/notes`, { method: "PATCH", body: JSON.stringify({ notes }) }),
    adminCreateQuotation: async (id: string, body: unknown) =>
      apiFetch(`/api/admin/custom-creations/${encodeURIComponent(id)}/quotation`, { method: "POST", body: JSON.stringify(body) }),
    adminSendQuotation: async (id: string, quotationId: string) =>
      apiFetch(`/api/admin/custom-creations/${encodeURIComponent(id)}/quotation`, { method: "PATCH", body: JSON.stringify({ quotationId, action: "send" }) }),
    adminImageUrl: async (id: string, imageId: string) =>
      apiFetch(`/api/admin/custom-creations/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}/signed-url`),
  },
  addresses: {
    list: async () => {
      return apiFetch("/api/addresses");
    },
    create: async (body: unknown) => {
      return apiFetch("/api/addresses", { method: "POST", body: JSON.stringify(body) });
    },
    update: async (id: string, patch: unknown) => {
      return apiFetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    },
    remove: async (id: string) => {
      return apiFetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  },
};
