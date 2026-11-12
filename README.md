# HamzaOne

A Cloudflare Workers storefront and admin panel for ready-made 3D printed goods and custom print quotes, built with Next.js (App Router) and deployed via OpenNext. The app serves its own backend: `app/api/*` route handlers back the storefront, checkout, and admin panel, with `lib/server/*` reading and writing Cloudflare KV. Checkout supports Razorpay test-mode payments; customer orders are stored in KV.

## Getting started

```bash
npm install
npm run dev
```

`npm run dev` runs the Next.js app, including its `/api/*` routes, against local KV/secrets loaded from `.dev.vars`. Visit `/prototype` for a single-page index linking every route and state in the app.

To preview the app the way it runs in production (as a Cloudflare Worker via OpenNext, including the incremental cache KV binding):

```bash
npm run cf:preview
```

This builds with `opennextjs-cloudflare` and serves it with `wrangler`; the local URL is normally [http://127.0.0.1:8787](http://127.0.0.1:8787).

## Environment

1. Copy `.dev.vars.example` to `.dev.vars` and fill in the service credentials (Razorpay, NimbusPost). `.dev.vars` is what Wrangler/OpenNext load locally; it's the Worker equivalent of server-side secrets.
2. Copy `.env.example` to `.env` for Next.js build-time variables (`NEXT_PUBLIC_API_URL`, `CF_DATA_KV_ID`, `CLOUDFLARE_ACCOUNT_ID`).
3. `NEXT_PUBLIC_API_URL` tells the frontend where to call `/api/*` from. In production this points at the app's own deployed origin (self-referential, since the API now lives in this same app). For local development, point it at your local origin (e.g. `http://localhost:3000` for `next dev`, or `http://127.0.0.1:8787` for `cf:preview`) so requests don't leave your machine.

## Stack

- Next.js 16 (App Router) + TypeScript
- Deployed to Cloudflare Workers via `@opennextjs/cloudflare`
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- Zustand for cart, wishlist and toast state (the cart persists across reloads)
- lucide-react icons
- next/font (Manrope 600/700/800, Inter 400/500/600)
- Vitest for unit tests (`tests/unit/`), Playwright for e2e tests (`tests/e2e/`, runs against `cf:preview`)

## Structure

- `app/(site)/…` — customer-facing routes (home, shop, product, cart, checkout, custom-print wizard, auth, account, wishlist, track-order, info pages)
- `app/admin/…` — admin panel (own layout with collapsible sidebar + top bar)
- `app/api/…` — route handlers for auth, products, categories, orders, admin, payments, delivery estimates, and custom-print quotes
- `components/` — shared UI (Button, Input variants, Header/Footer, ProductCard, CartDrawer, Stepper, Timeline, admin components, etc.)
- `store/` — Zustand stores (cart, wishlist, toast)
- `lib/format.ts` — INR currency formatting, class-name helper
- `lib/api.ts` — typed client the frontend uses to call `/api/*`
- `lib/server/` — KV-backed data access and auth/session helpers used by the API routes

## Production checkout notes

- **Razorpay test payments**: the checkout uses `/api/payments/create-order` and `/api/payments/verify-payment`; the server recomputes the cart total, creates the Razorpay order, verifies the signature, and captures authorized payments. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.dev.vars` locally and as Worker secrets in production. Use only keys beginning with `rzp_test_`; live keys are rejected. Do not put the secret in a `NEXT_PUBLIC_*` variable or commit it.
- **Order storage and tracking**: create the KV namespaces referenced in `wrangler.toml` (`AUTH_KV`, `ORDERS_KV`, `DATA_KV`, `NEXT_INC_CACHE_KV`) with `npx wrangler kv namespace create <NAME>`, then bind each namespace's returned ID in `wrangler.toml`. `NEXT_INC_CACHE_KV` is required for OpenNext's incremental cache and must use that exact binding name — the app fails to start without it. KV is eventually consistent, so a newly written order may take a short time to appear from a different Cloudflare location.
- **Payment reconciliation**: set `RAZORPAY_WEBHOOK_SECRET` in `.dev.vars` and as a Worker secret, then configure the Razorpay webhook URL as `https://<your-domain>/api/payments/webhook` and subscribe to `payment.captured`. The webhook lets KV reflect a captured payment even if the customer closes the checkout before the browser finishes verification.
- The original design link (`claude.ai/artifact/...`) was not accessible to the assistant (not shared), so this build was implemented directly from the detailed written spec rather than pixel-diffed against the Claude canvas boards. If you share the artifact, a follow-up pass can true up spacing/typography against it directly.
- The project folder is named `hamzaone` (lowercase) because npm package names can't contain capital letters — the app title and all on-screen branding is "HamzaOne".
