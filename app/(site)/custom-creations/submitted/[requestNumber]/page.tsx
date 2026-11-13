import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";

export const metadata: Metadata = { title: "Request Submitted", robots: { index: false, follow: false } };

export default async function CustomCreationsSubmittedPage({ params }: { params: Promise<{ requestNumber: string }> }) {
  const { requestNumber } = await params;

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold">Request submitted</h1>
      <p className="text-text-muted">
        Thank you — we&apos;ve received your custom creation request <strong className="text-text">{requestNumber}</strong>.
        Our team will review it and send you a quotation by email.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href={`/custom-creations/track?requestNumber=${encodeURIComponent(requestNumber)}`}>
          <Button>Track this request</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline">Explore Ready-Made Products</Button>
        </Link>
      </div>
    </div>
  );
}
