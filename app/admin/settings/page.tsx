"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Field } from "@/components/Input";
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
          ) : (
            <div className="flex flex-col gap-4 max-w-md">
              {section === "store" && (
                <>
                  <Field id="store-name" label="Store name" defaultValue="HamzaOne" />
                  <Field id="store-email" label="Support email" defaultValue="[SUPPORT EMAIL]" />
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
