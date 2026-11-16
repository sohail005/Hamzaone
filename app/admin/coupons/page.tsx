"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";

type Coupon = { code: string; type: "flat" | "percent"; value: number; minOrder: number; enabled: boolean; expires?: string };

function CouponsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const editing = params.get("edit");

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ code: "", type: "flat" as "flat" | "percent", value: 0, minOrder: 0, expires: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.list("coupons").then(({ coupons }: { coupons: Coupon[] }) => {
      setCoupons(coupons);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  const editingCoupon = editing ? coupons.find((c) => c.code === editing) : null;

  function startEdit(code: string) {
    const c = coupons.find((x) => x.code === code);
    if (c) setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, expires: c.expires ?? "" });
    setError(null);
    router.push(`/admin/coupons?edit=${code}`);
  }

  function startNew() {
    setForm({ code: "", type: "flat", value: 0, minOrder: 0, expires: "" });
    setError(null);
    router.push("/admin/coupons?new=1");
  }

  async function toggleEnabled(coupon: Coupon) {
    const nextEnabled = !coupon.enabled;
    setCoupons((cs) => cs.map((c) => (c.code === coupon.code ? { ...c, enabled: nextEnabled } : c)));
    try {
      await api.coupons.update(coupon.code, { enabled: nextEnabled });
    } catch {
      setCoupons((cs) => cs.map((c) => (c.code === coupon.code ? { ...c, enabled: coupon.enabled } : c)));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const { coupons: next } = await api.coupons.create({
          code: form.code,
          type: form.type,
          value: form.value,
          minOrder: form.minOrder,
          expires: form.expires || undefined,
        });
        setCoupons(next);
      } else if (editingCoupon) {
        const { coupons: next } = await api.coupons.update(editingCoupon.code, {
          type: form.type,
          value: form.value,
          minOrder: form.minOrder,
          expires: form.expires || undefined,
        });
        setCoupons(next);
      }
      router.push("/admin/coupons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this coupon.");
    } finally {
      setSaving(false);
    }
  }

  if (isNew || editing) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold">{isNew ? "New coupon" : `Edit ${editing}`}</h1>
        <form onSubmit={save} className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
          <Field id="code" label="Coupon code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required disabled={!isNew} />
          <div>
            <label className="text-sm font-semibold" htmlFor="coupon-type">Discount type</label>
            <select
              id="coupon-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "flat" | "percent" })}
              className="mt-1.5 h-12 w-full rounded-input border border-border-input bg-surface px-4 text-sm"
            >
              <option value="flat">Flat amount (₹)</option>
              <option value="percent">Percentage (%)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field id="value" label={form.type === "flat" ? "Discount value (₹)" : "Discount value (%)"} type="number" placeholder="0" value={form.value || ""} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            <Field id="minOrder" label="Minimum order (₹)" type="number" placeholder="0" value={form.minOrder || ""} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </div>
          <Field id="expires" label="Expires on (optional)" type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
          {error && <p className="text-sm text-error-text">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/coupons")}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={startNew}>New coupon</Button>
      </div>
      {coupons.length === 0 ? (
        <p className="text-sm text-text-muted">No coupons yet.</p>
      ) : (
      <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Min order</th><th className="px-4 py-3">Enabled</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3">{c.type === "flat" ? `₹${c.value}` : `${c.value}%`}</td>
                <td className="px-4 py-3">₹{c.minOrder}</td>
                <td className="px-4 py-3">
                  <Toggle checked={c.enabled} onChange={() => toggleEnabled(c)} label={`Toggle ${c.code} enabled`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(c.code)} className="text-xs font-semibold text-accent-text">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <Suspense>
      <CouponsContent />
    </Suspense>
  );
}
