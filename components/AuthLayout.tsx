import Link from "next/link";
import { ConceptRender } from "./ConceptRender";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-[1280px] grid-cols-1 gap-0 px-4 py-8 sm:px-6 md:grid-cols-2">
      <div className="hidden flex-col justify-between rounded-l-panel bg-dark p-10 text-white md:flex">
        <Link href="/" className="font-display text-xl font-extrabold">HamzaOne</Link>
        <div>
          <ConceptRender shape="vase" color="#F97316" className="aspect-square w-full rounded-panel" />
          <p className="mt-6 text-lg font-semibold">Your Ideas. Made Real.</p>
          <p className="mt-2 text-sm text-white/60">Ready-made and custom 3D printed Design Models, made in-house in India.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-6 rounded-r-panel bg-surface p-8 shadow-sm md:p-12">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
