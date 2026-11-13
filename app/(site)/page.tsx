import Link from "next/link";
import { getWorkerEnv, getKV } from "@/lib/server/kv";
import { listCategories } from "@/lib/server/categories-store";
import { listProducts } from "@/lib/server/products-store";
import { getFeaturedAndNewArrivals } from "@/app/api/home/route";
import { categoryShapes, customSteps, howItWorks, valueProps, homeReviews, homeFaqs, heroChecklist } from "@/data/home";
import { ConceptRender } from "@/components/ConceptRender";
import { HeroArt } from "@/components/HeroArt";
import { HomeProductCard } from "@/components/HomeProductCard";
import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Newsletter } from "@/components/Newsletter";

export default async function HomePage() {
  const env = await getWorkerEnv();
  const kv = getKV(env, "DATA_KV");
  const [categories, products, { featured, newArrivals }] = await Promise.all([
    kv ? listCategories(kv) : [],
    kv ? listProducts(kv) : [],
    getFeaturedAndNewArrivals(),
  ]);

  function categoryCount(slug: string) {
    return products.filter((p) => p.category === slug).length;
  }

  const featuredProducts = featured as Array<{ id: number; name: string; slug: string; price: number; shape: string; color: string; badge: string; availability: string }>;
  const newArrivalsProducts = newArrivals as Array<{ id: number; name: string; slug: string; price: number; shape: string; color: string; badge: string; availability: string }>;

  return (
    <main className="flex flex-col">
      <section className="mx-auto flex w-full flex-wrap items-center gap-12 px-4 py-[72px] sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-col gap-6" style={{ flex: "1 1 440px" }}>
          <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            3D printed in India · Ready-made and custom
          </span>
          <h1 className="font-display font-extrabold text-text" style={{ fontSize: "clamp(44px,6vw,80px)", lineHeight: 1.02 }}>
            Your Ideas.
            <br />
            Made Real.
          </h1>
          <p className="max-w-[520px] text-lg text-text-muted" style={{ fontSize: 19 }}>
            Precise, beautifully finished objects for your home, desk and gifts. Or upload your own STL or 3MF and we print it for you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop">
              <Button size="lg">Shop the collection</Button>
            </Link>
            <Link href="/custom-print">
              <Button size="lg" variant="outline">Upload your 3D model</Button>
            </Link>
          </div>
          <ul className="mt-2 flex flex-wrap gap-6 text-sm text-text-muted">
            {heroChecklist.map((item: string) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
        <HeroArt className="aspect-[5/4] min-h-[320px]" style={{ flex: "1 1 480px" }} />
      </section>

      <section className="mx-auto w-full px-4 py-6 sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[36px] font-bold">Shop by category</h2>
          <Link href="/shop" className="font-semibold text-accent-text">View all products →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((c: { slug: string; name: string }) => {
            const shape = categoryShapes[c.slug];
            return (
              <Link key={c.slug} href={`/shop/${c.slug}`} className="flex flex-col gap-3">
                <ConceptRender shape={shape.shape} color={shape.color} className="aspect-square rounded-card" />
                <div>
                  <strong className="font-display text-lg">{c.name}</strong>
                  <div className="text-sm text-text-muted">{categoryCount(c.slug)} products</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-9 sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Featured</span>
            <h2 className="mt-1 text-[36px] font-bold">Customer favourites</h2>
          </div>
          <Link href="/shop" className="font-semibold text-accent-text">Shop all →</Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {featuredProducts.map((p) => (
              <HomeProductCard key={p.id} card={p as unknown as never} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-text-muted">No products yet — check back soon.</p>
        )}
      </section>

      <section className="bg-dark text-bg">
        <div className="mx-auto flex w-full flex-wrap items-center gap-12 px-4 py-20 sm:px-6" style={{ maxWidth: 1280 }}>
          <div className="flex flex-col gap-5" style={{ flex: "1 1 420px" }}>
            <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-[#B9BBC1]">Custom 3D printing</span>
            <h2 className="font-display font-bold text-white" style={{ fontSize: "clamp(36px,4vw,56px)", lineHeight: 1.05 }}>
              Your Design.
              <br />
              Our Precision.
            </h2>
            <p className="max-w-[480px] text-lg text-[#C9CBD0]">
              Upload an STL or 3MF file, pick material and finish, and get a reviewed quote from our print team. You pay only after you accept the quote.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/custom-print">
                <Button size="lg">Upload Your 3D Model</Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline" className="border-[#5A5D63] text-white hover:bg-white/10">
                  How quotes work
                </Button>
              </Link>
            </div>
            <p className="text-[13px] text-[#9EA1A8]">STL, 3MF · up to 100 MB · PLA, PETG, TPU</p>
          </div>
          <ol className="grid list-none grid-cols-2 gap-4 p-0" style={{ flex: "1 1 420px" }}>
            {customSteps.map((s: { n: string; t: string; d: string }) => (
              <li key={s.n} className="flex flex-col gap-2 rounded-card border border-[#2F3237] p-5">
                <span className="font-display text-sm font-bold text-accent">{s.n}</span>
                <strong className="font-display text-lg text-white">{s.t}</strong>
                <span className="text-sm text-[#B9BBC1]">{s.d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-20 sm:px-6" style={{ maxWidth: 1280 }}>
        <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">How it works</span>
        <h2 className="mt-1 text-[36px] font-bold">From print bed to your door</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {howItWorks.map((h: { t: string; d: string }) => (
            <div key={h.t} className="flex flex-col gap-2 border-t-2 border-text pt-4">
              <strong className="font-display text-xl">{h.t}</strong>
              <span className="text-text-muted">{h.d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-9 sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Just printed</span>
            <h2 className="mt-1 text-[36px] font-bold">New arrivals</h2>
          </div>
          <Link href="/shop" className="font-semibold text-accent-text">See what is new →</Link>
        </div>
        {newArrivalsProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {newArrivalsProducts.map((p: { id: number; name: string; slug: string; price: number; shape: string; color: string; badge: string; availability: string }) => (
              <HomeProductCard key={p.id} card={p as unknown as never} variant="compact" />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-text-muted">No products yet — check back soon.</p>
        )}
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid w-full grid-cols-2 gap-8 px-4 py-16 sm:px-6 sm:grid-cols-4" style={{ maxWidth: 1280 }}>
          {valueProps.map((v: { n: string; t: string; d: string }) => (
            <div key={v.n} className="flex flex-col gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-chip font-display text-base font-bold text-[#8A4A0A]" style={{ backgroundColor: "#FDEBD8" }}>
                {v.n}
              </span>
              <strong className="font-display text-lg">{v.t}</strong>
              <span className="text-[15px] text-text-muted">{v.d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-[72px] sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[36px] font-bold">What customers say</h2>
          <span className="inline-flex rounded-chip bg-neutral-chip-bg px-2.5 py-1 text-xs font-semibold text-neutral-chip-text">
            Demo testimonials · replace with verified reviews
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {homeReviews.map((r: { who: string; q: string; what: string }) => (
            <figure key={r.who} className="m-0 flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
              <div aria-label="5 out of 5" className="text-accent-text" style={{ letterSpacing: 2 }}>★★★★★</div>
              <blockquote className="m-0 text-lg">&ldquo;{r.q}&rdquo;</blockquote>
              <figcaption className="text-sm text-text-muted">{r.who} · {r.what}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full flex-wrap gap-12 px-4 py-9 sm:px-6" style={{ maxWidth: 1280 }}>
        <div className="flex flex-col gap-3" style={{ flex: "1 1 300px" }}>
          <h2 className="text-[36px] font-bold">Questions, answered</h2>
          <p className="text-text-muted">Production, shipping and custom prints in plain words.</p>
          <Link href="/faq" className="font-semibold text-accent-text">Read all FAQs →</Link>
        </div>
        <div style={{ flex: "2 1 520px" }}>
          <FaqAccordion items={homeFaqs} />
        </div>
      </section>

      <section className="mx-auto w-full px-4 pb-20 sm:px-6" style={{ maxWidth: 1280 }}>
        <Newsletter />
      </section>
    </main>
  );
}
