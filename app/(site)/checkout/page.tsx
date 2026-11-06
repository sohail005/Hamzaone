import { Suspense } from "react";
import { CheckoutFlow } from "@/components/CheckoutFlow";

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutFlow />
    </Suspense>
  );
}
