import { Suspense } from "react";
import { QuoteView } from "@/components/QuoteView";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <QuoteView id={id} />
    </Suspense>
  );
}
