import type { Metadata } from "next";
import Link from "next/link";
import { ConceptRender } from "@/components/ConceptRender";
import { HeroArt } from "@/components/HeroArt";
import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  CUSTOM_CREATION_CATEGORIES,
  CUSTOM_CREATION_FAQS,
  CUSTOM_CREATION_HOW_IT_WORKS,
  CUSTOM_CREATION_WHY_CHOOSE_US,
} from "@/data/customCreations";

export const metadata: Metadata = {
  title: "Custom 3D Printing Services in India | HamzaOne",
  description:
    "Bring your ideas to life with HamzaOne custom 3D printing services. Share reference images, request personalized products, and receive a custom quotation.",
};

export default function CustomCreationsPage() {
  return (
    <main className="flex flex-col">
      <section className="mx-auto flex w-full flex-wrap items-center gap-12 px-4 py-[72px] sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-col gap-6" style={{ flex: "1 1 440px" }}>
          <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Custom Creations</span>
          <h1 className="font-display font-extrabold text-text" style={{ fontSize: "clamp(40px,5.5vw,72px)", lineHeight: 1.04 }}>
            Your Idea. Our Creativity. Made Real.
          </h1>
          <p className="max-w-[520px] text-lg text-text-muted" style={{ fontSize: 19 }}>
            Have something unique in mind? Share your idea, upload reference images, and let HamzaOne bring your imagination to life with custom 3D printing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/custom-creations/request">
              <Button size="lg">Create Your Custom Request</Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline">Explore Ready-Made Products</Button>
            </Link>
          </div>
        </div>
        <HeroArt className="aspect-[5/4] min-h-[320px]" style={{ flex: "1 1 480px" }} />
      </section>

      <section className="mx-auto w-full px-4 py-9 sm:px-6" style={{ maxWidth: 1280 }}>
        <h2 className="text-[32px] font-bold">What can we create for you?</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {CUSTOM_CREATION_CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/custom-creations/request?category=${c.slug}`} className="flex flex-col gap-3">
              <ConceptRender shape={c.shape} className="aspect-square rounded-card" />
              <strong className="font-display text-base">{c.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-dark text-bg">
        <div className="mx-auto w-full px-4 py-16 sm:px-6" style={{ maxWidth: 1280 }}>
          <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-[#B9BBC1]">How it works</span>
          <h2 className="mt-1 text-[32px] font-bold text-white">From idea to doorstep</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {CUSTOM_CREATION_HOW_IT_WORKS.map((s) => (
              <div key={s.n} className="flex flex-col gap-2 rounded-card border border-[#2F3237] p-5">
                <span className="font-display text-sm font-bold text-accent">{s.n}</span>
                <strong className="font-display text-lg text-white">{s.t}</strong>
                <span className="text-sm text-[#B9BBC1]">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-16 sm:px-6" style={{ maxWidth: 1280 }}>
        <h2 className="text-[32px] font-bold">Why choose HamzaOne</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {CUSTOM_CREATION_WHY_CHOOSE_US.map((v) => (
            <div key={v.t} className="flex flex-col gap-2 border-t-2 border-text pt-4">
              <strong className="font-display text-xl">{v.t}</strong>
              <span className="text-text-muted">{v.d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-9 sm:px-6" style={{ maxWidth: 1280 }}>
        <h2 className="text-[32px] font-bold">Frequently asked questions</h2>
        <div className="mt-6">
          <FaqAccordion items={CUSTOM_CREATION_FAQS} />
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-20 text-center sm:px-6" style={{ maxWidth: 1280 }}>
        <h2 className="text-[32px] font-bold">Ready to bring your idea to life?</h2>
        <p className="mx-auto mt-2 max-w-[480px] text-text-muted">No 3D model needed — just photos, sketches, or a description.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/custom-creations/request">
            <Button size="lg">Create Your Custom Request</Button>
          </Link>
          <Link href="/shop">
            <Button size="lg" variant="outline">Explore Ready-Made Products</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
