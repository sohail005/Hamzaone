"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Field } from "@/components/Input";
import { api } from "@/lib/api";

type Address = {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pin: string;
  type: "Home" | "Work";
  isDefault: boolean;
};

const BLANK_FORM: Omit<Address, "id" | "isDefault"> = { name: "", line1: "", city: "", state: "", pin: "", type: "Home" };

function AddressesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const editing = params.get("edit");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, "id" | "isDefault">>(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.addresses
      .list()
      .then(({ addresses }: { addresses: Address[] }) => {
        if (active) setAddresses(addresses);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function startEdit(addr?: Address) {
    setForm(addr ?? BLANK_FORM);
    router.push(`/account/addresses?edit=${addr?.id ?? "new"}`);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        const { address } = await api.addresses.create(form);
        setAddresses((a) => [...a.map((x) => (address.isDefault ? { ...x, isDefault: false } : x)), address]);
      } else if (editing) {
        const { address } = await api.addresses.update(editing, form);
        setAddresses((a) => a.map((x) => (x.id === editing ? address : x)));
      }
      router.push("/account/addresses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this address.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.addresses.remove(id);
      setAddresses((a) => {
        const removed = a.find((x) => x.id === id);
        const remaining = a.filter((x) => x.id !== id);
        if (removed?.isDefault && remaining.length > 0 && !remaining.some((x) => x.isDefault)) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this address.");
    }
  }

  async function makeDefault(id: string) {
    try {
      await api.addresses.update(id, { isDefault: true });
      setAddresses((a) => a.map((x) => ({ ...x, isDefault: x.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set this as your default address.");
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{editing === "new" ? "Add address" : "Edit address"}</h1>
        {error && <div className="rounded-card bg-error-tint px-4 py-3 text-sm text-error-tint-text">{error}</div>}
        <form onSubmit={save} className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
          <Field id="name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Field id="line1" label="Address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Field id="city" label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Field id="state" label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>
          <Field id="pin" label="PIN code" value={form.pin} maxLength={6} onChange={(e) => setForm({ ...form, pin: e.target.value })} required />
          <div className="flex gap-2">
            {(["Home", "Work"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} className={`rounded-full px-4 py-2 text-sm font-semibold ${form.type === t ? "bg-mto-chip-bg text-accent-text" : "border border-border-input"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/account/addresses")}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved addresses</h1>
        <Button onClick={() => startEdit()}>Add address</Button>
      </div>
      {error && <div className="rounded-card bg-error-tint px-4 py-3 text-sm text-error-tint-text">{error}</div>}
      {loading && <p className="text-sm text-text-muted">Loading addresses…</p>}
      {!loading && addresses.length === 0 && <p className="text-sm text-text-muted">No saved addresses yet.</p>}
      <ul className="flex flex-col gap-3">
        {addresses.map((a) => (
          <li key={a.id} className="rounded-card bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold">
              {a.name} · <span className="text-xs text-text-muted">{a.type}</span>
              {a.isDefault && <span className="ml-2 rounded-full bg-mto-chip-bg px-2 py-0.5 text-xs font-semibold text-accent-text">Default</span>}
            </p>
            <p className="text-sm text-text-muted">{a.line1}, {a.city}, {a.state} {a.pin}</p>
            <div className="mt-2 flex gap-3">
              {!a.isDefault && <button onClick={() => makeDefault(a.id)} className="text-xs font-semibold text-accent-text">Set as default</button>}
              <button onClick={() => startEdit(a)} className="text-xs font-semibold text-accent-text">Edit</button>
              <button onClick={() => remove(a.id)} className="text-xs font-semibold text-error-text">Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <Suspense>
      <AddressesContent />
    </Suspense>
  );
}
