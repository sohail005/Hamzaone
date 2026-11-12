import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping policy">
      <p>We ship across India. Standard shipping costs ₹79 and is free on orders above ₹1,499. Express shipping costs ₹149.</p>
      <p>Orders are dispatched within 3–6 business days of production completing (estimate), and delivery timelines vary by destination.</p>
      <p>You&apos;ll receive tracking details by email and SMS once your order ships.</p>
    </PolicyPage>
  );
}
