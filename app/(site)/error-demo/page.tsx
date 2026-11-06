"use client";

import { ErrorView } from "@/components/ErrorView";

export default function ErrorDemoPage() {
  return <ErrorView onRetry={() => window.location.reload()} />;
}
