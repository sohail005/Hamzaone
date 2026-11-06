"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function ErrorView({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <AlertTriangle className="h-12 w-12 text-error" />
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-text-muted">An unexpected error occurred. Reference: HO-ERR-48213</p>
      <div className="flex gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <Link href="/contact"><Button variant="outline">Contact support</Button></Link>
      </div>
    </div>
  );
}
