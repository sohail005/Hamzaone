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
