"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { PasswordField } from "@/components/Input";
import { Button } from "@/components/Button";
import { CheckCircle2 } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const done = params.get("done") === "1";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (done) {
    return (
      <AuthLayout title="Password reset">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-sm text-text-muted">Your password has been reset successfully.</p>
          <Link href="/login"><Button>Sign in</Button></Link>
        </div>
      </AuthLayout>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing. Please request a new reset link.");
      return;
    }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data?.error === "string" ? data.error : "Unable to reset password.");
        return;
      }

      router.push("/reset-password?done=1");
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <PasswordField id="password" label="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error ?? undefined} />
        <Button type="submit" size="lg" loading={loading}>Reset password</Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
