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
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (attempt === 0) {
        setAttempt(1);
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(next || "/account");
      }
    }, 600);
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to HamzaOne.">
      {expired && (
        <div className="rounded-card bg-warning-tint px-4 py-3 text-sm text-warning-text">
          Your session expired. Please sign in again.
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField id="password" required value={password} onChange={(e) => setPassword(e.target.value)} error={error ?? undefined} />
        <Link href="/forgot-password" className="self-end text-sm font-semibold text-accent-text">Forgot password?</Link>
        <Button type="submit" size="lg" loading={loading}>Sign in</Button>
      </form>
      <p className="text-sm text-text-muted">
        New here? <Link href="/register" className="font-semibold text-accent-text">Create an account</Link>
      </p>
      <p className="text-xs text-text-muted">Demo tip: first attempt always shows invalid credentials, second attempt succeeds.</p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
