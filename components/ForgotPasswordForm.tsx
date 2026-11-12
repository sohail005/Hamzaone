"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { Field } from "@/components/Input";
import { Button } from "@/components/Button";
import { MailCheck } from "lucide-react";

function ForgotForm() {
  const router = useRouter();
  const params = useSearchParams();
  const sent = params.get("sent") === "1";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="h-10 w-10 text-success" />
          <p className="text-sm text-text-muted">If an account exists for {email || "that email"}, we&apos;ve sent a password reset link.</p>
          <Link href="/login" className="text-sm font-semibold text-accent-text">Back to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll send you a link to reset it.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!email) {
            setError("Email is required.");
            return;
          }

          setLoading(true);
          setError(null);

          try {
            const response = await fetch("/api/auth/forgot-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              setError(typeof data?.error === "string" ? data.error : "Unable to send reset link.");
              return;
            }

            router.push("/forgot-password?sent=1");
          } catch {
            setError("Unable to send reset link right now.");
          } finally {
            setLoading(false);
          }
        }}
        className="flex flex-col gap-4"
      >
        <Field id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} />
        <Button type="submit" size="lg" loading={loading}>Send reset link</Button>
      </form>
      <Link href="/login" className="text-sm font-semibold text-accent-text">Back to sign in</Link>
    </AuthLayout>
  );
}

export function ForgotPasswordPageView() {
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
