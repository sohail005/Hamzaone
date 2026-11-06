"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { coupons as initial } from "@/data/admin";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";

function CouponsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const editing = params.get("edit");

  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState({ code: "", type: "flat" as "flat" | "percent", value: 0, minOrder: 0, expires: "" });

  const editingCoupon = editing ? coupons.find((c) => c.code === editing) : null;

  function startEdit(code: string) {
    const c = coupons.find((x) => x.code === code);
    if (c) setForm(c);
    router.push(`/admin/coupons?edit=${code}`);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (isNew) {
      setCoupons((c) => [...c, { ...form, enabled: true }]);
    } else if (editingCoupon) {
      setCoupons((c) => c.map((x) => (x.code === editingCoupon.code ? { ...x, ...form } : x)));
    }
    router.push("/admin/coupons");
  }

  if (isNew || editing) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold">{isNew ? "New coupon" : `Edit ${editing}`}</h1>
        <form onSubmit={save} className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
          <Field id="code" label="Coupon code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          <div className="grid grid-cols-2 gap-4">
            <Field id="value" label="Discount value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            <Field id="minOrder" label="Minimum order (₹)" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </div>
          <Field id="expires" label="Expires on" type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/coupons")}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button onClick={() => router.push("/admin/coupons?new=1")}>New coupon</Button>
      </div>
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
                  <button
                    onClick={() => setCoupons((arr) => arr.map((x) => (x.code === c.code ? { ...x, enabled: !x.enabled } : x)))}
                    className={`h-6 w-11 rounded-full transition-colors ${c.enabled ? "bg-success" : "bg-border-input"}`}
                  >
                    <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${c.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(c.code)} className="text-xs font-semibold text-accent-text">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
