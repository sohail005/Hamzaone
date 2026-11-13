const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://hamzaone.store").trim().replace(/\/$/, "");

type FetchStrategy = "revalidate" | "fresh";

async function apiFetch(path: string, init?: RequestInit, strategy: FetchStrategy = "fresh") {
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
        next: isRevalidatable ? { revalidate: 60 } : undefined,
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
      return apiFetch(`/api/products?${sp.toString()}`, undefined, "revalidate");
    },
    get: async (slug: string) => {
      return apiFetch(`/api/products/${encodeURIComponent(slug)}`, undefined, "revalidate");
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
    get: async (slug: string) => {
      return apiFetch(`/api/categories?slug=${encodeURIComponent(slug)}`, undefined, "revalidate");
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
      return apiFetch(`/api/home?${sp.toString()}`, undefined, "revalidate");
    },
  },
  customPrint: {
    list: async (section?: string) => {
      const sp = new URLSearchParams();
      if (section) sp.set("section", section);
      return apiFetch(`/api/custom-print?${sp.toString()}`, undefined, "revalidate");
    },
    upload: async (
      file: File,
      onProgress?: (pct: number) => void,
    ): Promise<{ key: string; originalName: string; originalSize: number }> => {
      const { gzipFile } = await import("./compressFile");
      const { blob, compressed } = await gzipFile(file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/api/custom-print/upload`);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("X-Original-Name", encodeURIComponent(file.name));
        xhr.setRequestHeader("X-Original-Size", String(file.size));
        xhr.setRequestHeader("X-Original-Type", file.type || "application/octet-stream");
        xhr.setRequestHeader("X-Content-Encoding", compressed ? "gzip" : "identity");

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
        xhr.send(blob);
      });
    },
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
