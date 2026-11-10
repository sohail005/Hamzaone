# HamzaOne

A static Cloudflare Pages storefront and admin panel for ready-made 3D printed goods and custom print quotes. Catalog and admin data use mock data. Checkout supports Razorpay test-mode payments through Cloudflare Pages Functions; orders are not persisted.

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
- **Razorpay test payments**: set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as Cloudflare Pages secrets. Use only keys beginning with `rzp_test_`; live keys are rejected. For local Pages Functions testing, put the credentials in the ignored `.dev.vars` file:

  ```dotenv
  RAZORPAY_KEY_ID=rzp_test_your_key_id
  RAZORPAY_KEY_SECRET=your_test_key_secret
  ```

  Then run `npm run build` followed by `npx wrangler pages dev out`. Do not put the secret in a `NEXT_PUBLIC_*` variable or commit it. The API creates orders and verifies/captures payments, but there is no database or webhook-backed order persistence.
- **OTP (demo code `123456`), login (first attempt fails, second succeeds), and all admin actions** remain simulated via prototype buttons; no real SMS provider is called.
- The original design link (`claude.ai/artifact/...`) was not accessible to the assistant (not shared), so this build was implemented directly from the detailed written spec rather than pixel-diffed against the Claude canvas boards. If you share the artifact, a follow-up pass can true up spacing/typography against it directly.
- Admin inventory/production/coupons state resets on reload (no persistence layer), consistent with the "front-end only" scope.
- The project folder is named `hamzaone` (lowercase) because npm package names can't contain capital letters — the app title and all on-screen branding is "HamzaOne".
