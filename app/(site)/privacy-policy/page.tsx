import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";
import { SUPPORT_EMAIL } from "@/data/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy policy">
      <p>We collect the information needed to process your orders: name, contact details, shipping address and payment status.</p>
      <p>We never sell your personal data. Uploaded 3D models are used solely to produce your custom print request.</p>
      <p>For data requests, contact {SUPPORT_EMAIL}.</p>
    </PolicyPage>
  );
}
