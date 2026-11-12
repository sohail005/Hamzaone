import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default function ReturnPolicyPage() {
  return (
    <PolicyPage title="Returns and refunds">
      <p>Ready-made products can be returned within 7 days of delivery if unused and in original packaging.</p>
      <p>Custom and personalised prints are made to order and are not eligible for return unless the item arrives defective or damaged.</p>
      <p>Refunds are processed to the original payment method within 5–7 business days of approval.</p>
    </PolicyPage>
  );
}
