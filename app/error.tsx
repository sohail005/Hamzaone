"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErrorView } from "@/components/ErrorView";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ErrorView onRetry={reset} />
      </main>
      <Footer />
    </>
  );
}
