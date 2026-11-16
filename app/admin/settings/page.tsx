"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { cx } from "@/lib/format";

const SECTIONS = [
  { key: "store", label: "Store details" },
  { key: "branding", label: "Branding" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment", restricted: true },
  { key: "tax", label: "Tax", restricted: true },
  { key: "notifications", label: "Notifications" },
  { key: "account", label: "Admin accounts", restricted: true },
];

type StoreSettings = {
  storeName: string;
  supportEmail: string;
  accentColor: string;
  standardShipping: string;
  expressShipping: string;
  freeShippingThreshold: string;
};

const EMPTY_SETTINGS: StoreSettings = { storeName: "", supportEmail: "", accentColor: "", standardShipping: "", expressShipping: "", freeShippingThreshold: "" };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const ACCENT_HINT = "6-digit hex code, e.g. #2563EB";

function SettingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const section = params.get("section") ?? "store";
  const [role, setRole] = useState<"Owner" | "Staff">("Owner");

  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<StoreSettings>(EMPTY_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.storeSettings
      .get()
      .then(({ settings }) => {
        setForm({
          storeName: settings.storeName ?? "",
          supportEmail: settings.supportEmail ?? "",
          accentColor: settings.accentColor ?? "",
          standardShipping: settings.standardShipping != null ? String(settings.standardShipping) : "",
          expressShipping: settings.expressShipping != null ? String(settings.expressShipping) : "",
          freeShippingThreshold: settings.freeShippingThreshold != null ? String(settings.freeShippingThreshold) : "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load settings."))
      .finally(() => setLoaded(true));
  }, []);

  const current = SECTIONS.find((s) => s.key === section) ?? SECTIONS[0];
  const locked = !!current.restricted && role === "Staff";
  const accentValid = form.accentColor === "" || HEX_COLOR.test(form.accentColor);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (section === "branding" && !accentValid) {
      setError(`Enter a valid colour (${ACCENT_HINT}).`);
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const patch =
        section === "store"
          ? { storeName: form.storeName, supportEmail: form.supportEmail }
          : section === "branding"
          ? { accentColor: form.accentColor }
          : section === "shipping"
          ? {
              standardShipping: Number(form.standardShipping) || 0,
              expressShipping: Number(form.expressShipping) || 0,
              freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
            }
          : null;
      if (patch) {
        await api.storeSettings.update(patch);
        setSaved(true);
        if (section === "branding") router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  const canSave = !locked && ["store", "branding", "shipping"].includes(section);

  if (!loaded) return null;

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
              onClick={() => {
                setSaved(false);
                setError(null);
                router.push(`/admin/settings?section=${s.key}`);
              }}
              className={cx("flex items-center justify-between rounded-chip px-3 py-2.5 text-left text-sm font-medium", section === s.key ? "bg-mto-chip-bg text-accent-text" : "text-text hover:bg-bg")}
            >
              {s.label}
              {s.restricted && <Lock className="h-3.5 w-3.5 text-text-muted" />}
            </button>
          ))}
        </nav>

        <form onSubmit={save} className="rounded-card bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">{current.label}</h2>
          {locked ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Lock className="h-4 w-4" /> This section is read-only for Staff accounts. Switch to Owner to make changes.
            </p>
          ) : (
            <div className="flex flex-col gap-4 max-w-md">
              {section === "store" && (
                <>
                  <Field id="store-name" label="Store name" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                  <Field id="store-email" label="Support email" placeholder="support@hamzaone.store" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
                </>
              )}
              {section === "branding" && (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Field
                      id="accent"
                      label="Accent colour"
                      placeholder="#F97316"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      hint={!form.accentColor || accentValid ? ACCENT_HINT : undefined}
                      error={form.accentColor && !accentValid ? `Not a valid hex colour — use the format ${ACCENT_HINT}` : undefined}
                    />
                  </div>
                  <div
                    aria-hidden
                    className="mt-[30px] h-12 w-12 shrink-0 rounded-[12px] border border-border-input"
                    style={{ backgroundColor: accentValid ? form.accentColor : "transparent" }}
                  />
                </div>
              )}
              {section === "shipping" && (
                <>
                  <Field id="standard" label="Standard shipping (₹)" type="number" placeholder="0" value={form.standardShipping} onChange={(e) => setForm({ ...form, standardShipping: e.target.value })} />
                  <Field id="express" label="Express shipping (₹)" type="number" placeholder="0" value={form.expressShipping} onChange={(e) => setForm({ ...form, expressShipping: e.target.value })} />
                  <Field
                    id="free-shipping-threshold"
                    label="Free standard shipping above (₹)"
                    type="number"
                    placeholder="1499"
                    value={form.freeShippingThreshold}
                    onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
                    hint="Orders at or above this subtotal get free standard shipping. Express shipping is never free."
                  />
                </>
              )}
              {section === "notifications" && <p className="text-sm text-text-muted">Email notifications are sent for new orders, low stock and custom creation requests.</p>}
            </div>
          )}
          {error && <p className="mt-3 text-sm text-error-text">{error}</p>}
          {saved && !error && <p className="mt-3 text-sm font-semibold text-success-text">✓ Settings saved</p>}
          {canSave && (
            <Button type="submit" className="mt-4" disabled={saving || (section === "branding" && !accentValid)}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          )}
        </form>
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
