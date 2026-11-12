"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { Field, PasswordField } from "@/components/Input";
import { Button } from "@/components/Button";

export function RegisterPageView() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!form.name) e2.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e2.email = "Enter a valid email address.";
    if (form.password.length < 8) e2.password = "Password must be at least 8 characters.";
    setErrors(e2);

    if (Object.keys(e2).length > 0) return;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof data?.error === "string" ? data.error : "Unable to create account.";
        setErrors((current) => ({ ...current, email: message }));
        return;
      }

      router.push("/account?welcome=1");
    } catch {
      setErrors((current) => ({ ...current, email: "Unable to create account right now." }));
    }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Save addresses, track orders and manage custom print requests.">
      <a
        href={`/api/auth/google?next=${encodeURIComponent("/account?welcome=1")}`}
        className="flex items-center justify-center gap-2 rounded-card border border-border-input px-4 py-3 text-sm font-semibold hover:bg-bg"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.3 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.6 0-14.1 4.3-17.4 10.7z" />
          <path fill="#4CAF50" d="M24 44c5.3 0 10.1-1.8 13.9-5l-6.4-5.4C29.5 35.1 26.9 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.5 5C9.8 39.7 16.3 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.2 5.9l6.4 5.4C40.9 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
        </svg>
        Continue with Google
      </a>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field id="name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <Field id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <PasswordField id="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} hint={!errors.password ? "At least 8 characters." : undefined} />
        <Button type="submit" size="lg">Create account</Button>
      </form>
      <p className="text-sm text-text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-accent-text">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
