import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/CheckoutFlow";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutFlow />
    </Suspense>
  );
}
