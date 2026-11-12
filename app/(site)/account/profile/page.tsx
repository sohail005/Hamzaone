"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { useToast } from "@/store/toast";

type Me = { name: string; email: string; phone: string; avatarUrl: string; provider: "password" | "google" };

export default function ProfilePage() {
  const push = useToast((s) => s.push);
  const [form, setForm] = useState<Me>({ name: "", email: "", phone: "", avatarUrl: "", provider: "password" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(({ user }: { user: Me }) => {
        if (active) setForm(user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!response.ok) throw new Error();
      push("Profile saved");
    } catch {
      push("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted">Loading profile…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Profile settings</h1>
      <div className="flex items-center gap-4">
        <Avatar name={form.name} src={form.avatarUrl} size={64} />
        {form.provider === "google" ? (
          <p className="text-xs text-text-muted">Photo synced from your Google account.</p>
        ) : (
          <p className="text-xs text-text-muted">Sign in with Google to add a profile photo.</p>
        )}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
        <Field id="name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field id="email" label="Email" type="email" value={form.email} disabled />
        <Field id="phone" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Button type="submit" className="self-start" loading={saving}>Save changes</Button>
      </form>
      {form.provider === "password" && (
        <Link href="/forgot-password" className="text-sm font-semibold text-accent-text">Change password</Link>
      )}
    </div>
  );
}
