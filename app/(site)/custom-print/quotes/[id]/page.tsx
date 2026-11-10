import { Suspense } from "react";
import { QuoteView } from "@/components/QuoteView";
import { quote } from "@/data/customPrint";

export async function generateStaticParams() {
  return [{ id: quote.id }];
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <QuoteView id={id} />
    </Suspense>
  );
}
