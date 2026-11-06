"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Field } from "@/components/Input";

type Address = {
  id: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
  type: "Home" | "Work";
};

function AddressesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const editing = params.get("edit");

  const [addresses, setAddresses] = useState<Address[]>([
    { id: "a1", name: "Riya Sharma", line1: "4th Cross, Sector 2, HSR Layout", city: "Bengaluru", state: "Karnataka", pin: "560102", type: "Home" },
  ]);

  const [form, setForm] = useState<Address>({ id: "", name: "", line1: "", city: "", state: "", pin: "", type: "Home" });

  function startEdit(addr?: Address) {
    setForm(addr ?? { id: "", name: "", line1: "", city: "", state: "", pin: "", type: "Home" });
    router.push(`/account/addresses?edit=${addr?.id ?? "new"}`);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (editing === "new") {
      setAddresses((a) => [...a, { ...form, id: `a${Date.now()}` }]);
    } else {
      setAddresses((a) => a.map((x) => (x.id === editing ? form : x)));
    }
    router.push("/account/addresses");
  }

  function remove(id: string) {
    setAddresses((a) => a.filter((x) => x.id !== id));
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{editing === "new" ? "Add address" : "Edit address"}</h1>
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
            <Button type="submit">Save</Button>
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
      <ul className="flex flex-col gap-3">
        {addresses.map((a) => (
          <li key={a.id} className="rounded-card bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold">{a.name} · <span className="text-xs text-text-muted">{a.type}</span></p>
            <p className="text-sm text-text-muted">{a.line1}, {a.city}, {a.state} {a.pin}</p>
            <div className="mt-2 flex gap-3">
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
