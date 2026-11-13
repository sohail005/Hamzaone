import type { Metadata } from "next";
import { CUSTOM_CREATION_FAQS } from "@/data/customCreations";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about production, shipping and custom creation requests at HamzaOne.",
};

export default async function FaqPage() {
  const faqs = CUSTOM_CREATION_FAQS;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">FAQ</h1>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {faqs.map((f: { category: string; q: string; a: string }) => (
          <div key={f.q} className="rounded-card border border-border bg-surface p-4 shadow-sm">
            <p className="text-xs font-semibold text-text-muted uppercase">{f.category}</p>
            <p className="mt-1 text-sm font-medium">{f.q}</p>
            <p className="mt-2 text-sm text-text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
