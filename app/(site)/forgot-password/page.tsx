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

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="h-10 w-10 text-success" />
          <p className="text-sm text-text-muted">We&apos;ve sent a password reset link to {email || "your email"}.</p>
          <Link href="/reset-password?token=demo" className="text-sm font-semibold text-accent-text">
            Prototype: open reset link
          </Link>
          <Link href="/login" className="text-sm font-semibold text-accent-text">Back to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll send you a link to reset it.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/forgot-password?sent=1");
        }}
        className="flex flex-col gap-4"
      >
        <Field id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" size="lg">Send reset link</Button>
      </form>
      <Link href="/login" className="text-sm font-semibold text-accent-text">Back to sign in</Link>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
