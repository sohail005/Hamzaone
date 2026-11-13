import type { Metadata } from "next";
import { QuotationView } from "./QuotationView";

export const metadata: Metadata = { title: "Your Quotation", robots: { index: false, follow: false } };

export default async function QuotationPage({ params }: { params: Promise<{ secureToken: string }> }) {
  const { secureToken } = await params;
  return <QuotationView secureToken={secureToken} />;
}
