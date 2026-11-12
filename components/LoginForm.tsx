"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { Field, PasswordField } from "@/components/Input";
import { Button } from "@/components/Button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const expired = params.get("expired") === "1";
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof data?.error === "string" ? data.error : "Invalid email or password.";
        setError(message);
        return;
      }

      router.push(next || "/account");
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to HamzaOne.">
      {expired && (
        <div className="rounded-card bg-warning-tint px-4 py-3 text-sm text-warning-text">
          Your session expired. Please sign in again.
        </div>
      )}
      <a
        href={`/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`}
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
        <Field id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField id="password" required value={password} onChange={(e) => setPassword(e.target.value)} error={error ?? undefined} />
        <Link href="/forgot-password" className="self-end text-sm font-semibold text-accent-text">Forgot password?</Link>
        <Button type="submit" size="lg" loading={loading}>Sign in</Button>
      </form>
      <p className="text-sm text-text-muted">
        New here? <Link href="/register" className="font-semibold text-accent-text">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function LoginPageView() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
