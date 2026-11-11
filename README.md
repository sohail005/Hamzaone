# HamzaOne

A static Cloudflare Pages storefront and admin panel for ready-made 3D printed goods and custom print quotes. Catalog and admin data use mock data. Checkout supports Razorpay test-mode payments through Cloudflare Pages Functions; orders are not persisted.

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` starts the Next.js UI only. Cloudflare Pages Functions (including `/api/delivery-estimate`) are not served by `next dev`, so API requests will return 404 there.

To run the app with its API functions locally:

1. Copy `.dev.vars.example` to `.dev.vars` and fill in the service credentials.
2. Run `npm run dev:pages`.
3. Open the local URL printed by Wrangler (normally [http://localhost:8788](http://localhost:8788)).

This builds the static site and runs it with the Pages Functions runtime. Visit `/prototype` for a single-page index linking every route and state in the app.

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
- `store/` — Zustand stores (cart, wishlist, toast)
- `lib/format.ts` — INR currency formatting, class-name helper
- `functions/api/` — backend endpoints that are expected to be served by the real API layer

## Real backend requirement

The storefront no longer falls back to static demo data. Set `NEXT_PUBLIC_API_URL` to your real backend origin before running the app.

```bash
cp .env.example .env
# set NEXT_PUBLIC_API_URL=https://api.example.com
npm install
npm run dev
```

If `NEXT_PUBLIC_API_URL` is not configured, the app will fail fast instead of silently switching to demo/mock data.

## Production checkout notes

- **Razorpay test payments**: the checkout uses Cloudflare Pages Functions at `/api/payments/create-order` and `/api/payments/verify-payment`; the server recomputes the cart total, creates the Razorpay order, verifies the signature, and captures authorized payments. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as Cloudflare Pages secrets in production. Use only keys beginning with `rzp_test_`; live keys are rejected. The ignored `.env` file may hold these variables for local configuration, but Pages Functions load their local secrets from `.dev.vars`:

  ```dotenv
  RAZORPAY_KEY_ID=rzp_test_your_key_id
  RAZORPAY_KEY_SECRET=your_test_key_secret
  ```

  Then run `npm run build` followed by `npx wrangler pages dev out`. Do not put the secret in a `NEXT_PUBLIC_*` variable or commit it.
- The original design link (`claude.ai/artifact/...`) was not accessible to the assistant (not shared), so this build was implemented directly from the detailed written spec rather than pixel-diffed against the Claude canvas boards. If you share the artifact, a follow-up pass can true up spacing/typography against it directly.
- The project folder is named `hamzaone` (lowercase) because npm package names can't contain capital letters — the app title and all on-screen branding is "HamzaOne".
