# HamzaOne

A front-end-only, pixel-oriented implementation of the HamzaOne storefront and admin panel: ready-made 3D printed goods plus a custom 3D print quoting flow. No backend, no database, no real payments — everything runs on static mock data and client state.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visit `/prototype` for a single-page index linking every route and state in the app.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- Zustand for cart, wishlist and toast state (in-memory only, resets on reload)
- lucide-react icons
- next/font (Manrope 600/700/800, Inter 400/500/600)

## Structure

- `app/(site)/…` — customer-facing routes (home, shop, product, cart, checkout, custom-print wizard, auth, account, wishlist, track-order, info pages)
- `app/admin/…` — admin panel (own layout with collapsible sidebar + top bar)
- `components/` — shared UI (Button, Input variants, Header/Footer, ProductCard, CartDrawer, Stepper, Timeline, admin components, etc.)
- `data/` — static mock data: 24 products, categories, demo orders, custom-print quote, FAQs, admin data (customers, coupons, payments, inventory, production)
- `store/` — Zustand stores (cart, wishlist, toast)
- `lib/format.ts` — INR currency formatting, class-name helper

## Mock data consistency

- Demo order **HO-2026-10482**: Spiral Decor Vase (Terracotta, Small) × 1 = ₹699 + Minimal Phone Stand (Charcoal) × 2 = ₹498 → subtotal ₹1,197 − ₹100 (coupon `FIRST100`) + ₹79 shipping = **₹1,176**
- Demo custom-print quote **CPR-2611-0738**: ₹1,560 printing + ₹280 material + ₹79 shipping = **₹1,919**, valid until 13 Nov 2026
- Coupon `FIRST100`: ₹100 off, minimum order ₹999. Any other code is shown as invalid.
- Shipping: ₹79 standard (free at ₹1,499+), ₹149 express.

## Things to know / known gaps

- **Product imagery** is CSS-only "Concept render" shapes (per spec) rather than real photography/3D renders.
- **State persistence**: cart, wishlist, addresses, and most wizard state live in React/Zustand state only — a hard refresh resets them. This matches the "front-end only, no backend" scope, but means in-progress flows don't survive a reload.
- **The Razorpay modal, OTP (demo code `123456`), login (first attempt fails, second succeeds), and all admin actions** are simulated via prototype buttons, exactly as specified — nothing calls a real payment or SMS provider.
- The original design link (`claude.ai/artifact/...`) was not accessible to the assistant (not shared), so this build was implemented directly from the detailed written spec rather than pixel-diffed against the Claude canvas boards. If you share the artifact, a follow-up pass can true up spacing/typography against it directly.
- Admin inventory/production/coupons state resets on reload (no persistence layer), consistent with the "front-end only" scope.
- The project folder is named `hamzaone` (lowercase) because npm package names can't contain capital letters — the app title and all on-screen branding is "HamzaOne".
