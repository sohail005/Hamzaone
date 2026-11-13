"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { api } from "@/lib/api";
import { cx } from "@/lib/format";
import type { MaterialsConfig } from "@/lib/server/custom-print-materials";

const SECTIONS = [
  { key: "store", label: "Store details" },
  { key: "branding", label: "Branding" },
  { key: "shipping", label: "Shipping" },
  { key: "custom-print", label: "Custom print" },
  { key: "payment", label: "Payment", restricted: true },
  { key: "tax", label: "Tax", restricted: true },
  { key: "notifications", label: "Notifications" },
  { key: "account", label: "Admin accounts", restricted: true },
];

function CustomPrintMaterialsSection() {
  const [config, setConfig] = useState<MaterialsConfig | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "saved" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [newMaterialKey, setNewMaterialKey] = useState("");
  const [newColorInputs, setNewColorInputs] = useState<Record<string, string>>({});
  const [newFinishInputs, setNewFinishInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    api.admin.customPrintMaterials
      .get()
      .then(({ config }: { config: MaterialsConfig }) => {
        setConfig(config);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load custom print materials.");
        setStatus("error");
      });
  }, []);

  function toggleMaterial(key: string) {
    setConfig((c) => c && { materials: c.materials.map((m) => (m.key !== key ? m : { ...m, enabled: !m.enabled })) });
  }

  function toggleColor(key: string, name: string) {
    setConfig(
      (c) =>
        c && {
          materials: c.materials.map((m) =>
            m.key !== key ? m : { ...m, colors: m.colors.map((col) => (col.name !== name ? col : { ...col, enabled: !col.enabled })) },
          ),
        },
    );
  }

  function toggleFinish(key: string, name: string) {
    setConfig(
      (c) =>
        c && {
          materials: c.materials.map((m) =>
            m.key !== key ? m : { ...m, finishes: m.finishes.map((f) => (f.name !== name ? f : { ...f, enabled: !f.enabled })) },
          ),
        },
    );
  }

  function addColor(key: string) {
    const name = (newColorInputs[key] ?? "").trim();
    if (!name) return;
    setConfig(
      (c) =>
        c && {
          materials: c.materials.map((m) =>
            m.key !== key || m.colors.some((col) => col.name.toLowerCase() === name.toLowerCase())
              ? m
              : { ...m, colors: [...m.colors, { name, enabled: true }] },
          ),
        },
    );
    setNewColorInputs((s) => ({ ...s, [key]: "" }));
  }

  function addFinish(key: string) {
    const name = (newFinishInputs[key] ?? "").trim();
    if (!name) return;
    setConfig(
      (c) =>
        c && {
          materials: c.materials.map((m) =>
            m.key !== key || m.finishes.some((f) => f.name.toLowerCase() === name.toLowerCase())
              ? m
              : { ...m, finishes: [...m.finishes, { name, enabled: true }] },
          ),
        },
    );
    setNewFinishInputs((s) => ({ ...s, [key]: "" }));
  }

  function addMaterial() {
    const key = newMaterialKey.trim();
    if (!key) return;
    setConfig(
      (c) =>
        c && (c.materials.some((m) => m.key.toLowerCase() === key.toLowerCase()) ? c : { materials: [...c.materials, { key, enabled: true, colors: [], finishes: [] }] }),
    );
    setNewMaterialKey("");
  }

  async function save() {
    if (!config) return;
    setStatus("saving");
    try {
      const { config: saved } = await api.admin.customPrintMaterials.save(config);
      setConfig(saved);
      setStatus("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
      setStatus("error");
    }
  }

  async function reset() {
    setStatus("saving");
    try {
      const { config: saved } = await api.admin.customPrintMaterials.reset();
      setConfig(saved);
      setStatus("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset to defaults.");
      setStatus("error");
    }
  }

  if (status === "loading") return <p className="text-sm text-text-muted">Loading…</p>;
  if (!config) return <p className="text-sm text-error-text">{error ?? "Could not load custom print materials."}</p>;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">
        Control which materials, colours and finishes customers can pick from in the custom print flow. Disabled items stay here but won&apos;t show up for customers.
      </p>

      {config.materials.map((m) => (
        <div key={m.key} className="rounded-input border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{m.key}</span>
            <Toggle checked={m.enabled} onChange={() => toggleMaterial(m.key)} label={`Toggle ${m.key}`} />
          </div>

          <div className="mt-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Colours</h4>
            <div className="flex flex-wrap gap-2">
              {m.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => toggleColor(m.key, c.name)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    c.enabled ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted line-through",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Field
                id={`new-color-${m.key}`}
                value={newColorInputs[m.key] ?? ""}
                onChange={(e) => setNewColorInputs((s) => ({ ...s, [m.key]: e.target.value }))}
                placeholder="Add colour"
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={() => addColor(m.key)}>Add</Button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Finishes</h4>
            <div className="flex flex-wrap gap-2">
              {m.finishes.map((f) => (
                <button
                  key={f.name}
                  onClick={() => toggleFinish(m.key, f.name)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    f.enabled ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input text-text-muted line-through",
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Field
                id={`new-finish-${m.key}`}
                value={newFinishInputs[m.key] ?? ""}
                onChange={(e) => setNewFinishInputs((s) => ({ ...s, [m.key]: e.target.value }))}
                placeholder="Add finish"
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={() => addFinish(m.key)}>Add</Button>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-input border border-dashed border-border-input p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Add material</h4>
        <div className="flex gap-2">
          <Field id="new-material" value={newMaterialKey} onChange={(e) => setNewMaterialKey(e.target.value)} placeholder="e.g. ABS" className="flex-1" />
          <Button size="sm" variant="outline" onClick={addMaterial}>Add</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save changes"}</Button>
        <Button variant="outline" onClick={reset} disabled={status === "saving"}>Reset to defaults</Button>
        {status === "saved" && <span className="text-xs text-success-text">Saved.</span>}
        {status === "error" && error && <span className="text-xs text-error-text">{error}</span>}
      </div>
    </div>
  );
}

function SettingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const section = params.get("section") ?? "store";
  const [role, setRole] = useState<"Owner" | "Staff">("Owner");

  const current = SECTIONS.find((s) => s.key === section) ?? SECTIONS[0];
  const locked = !!current.restricted && role === "Staff";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex items-center gap-2 rounded-full border border-border-input p-1">
          {(["Owner", "Staff"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cx("rounded-full px-3 py-1.5 text-sm font-medium", role === r ? "bg-dark text-white" : "text-text-muted")}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => router.push(`/admin/settings?section=${s.key}`)}
              className={cx("flex items-center justify-between rounded-chip px-3 py-2.5 text-left text-sm font-medium", section === s.key ? "bg-mto-chip-bg text-accent-text" : "text-text hover:bg-bg")}
            >
              {s.label}
              {s.restricted && <Lock className="h-3.5 w-3.5 text-text-muted" />}
            </button>
          ))}
        </nav>

        <div className="rounded-card bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">{current.label}</h2>
          {locked ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Lock className="h-4 w-4" /> This section is read-only for Staff accounts. Switch to Owner to make changes.
            </p>
          ) : section === "custom-print" ? (
            <CustomPrintMaterialsSection />
          ) : (
            <div className="flex flex-col gap-4 max-w-md">
              {section === "store" && (
                <>
                  <Field id="store-name" label="Store name" defaultValue="HamzaOne" />
                  <Field id="store-email" label="Support email" placeholder="support@hamzaone.store" />
                </>
              )}
              {section === "branding" && <Field id="accent" label="Accent colour" defaultValue="#F97316" />}
              {section === "shipping" && (
                <>
                  <Field id="standard" label="Standard shipping (₹)" defaultValue="79" />
                  <Field id="express" label="Express shipping (₹)" defaultValue="149" />
                </>
              )}
              {section === "notifications" && <p className="text-sm text-text-muted">Email notifications are sent for new orders, low stock and custom requests.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
