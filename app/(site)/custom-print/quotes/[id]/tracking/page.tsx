import Link from "next/link";
import { Button } from "@/components/Button";
import { Timeline } from "@/components/Timeline";
import { quote } from "@/data/customPrint";

const STEPS = ["Printing", "Post Processing", "Quality Check", "Packed", "Shipped", "Delivered"];

export async function generateStaticParams() {
  return [{ id: quote.id }];
}

export default function QuoteTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl rounded-card bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-bold">Order HO-2026-10517</h1>
        <p className="text-sm text-text-muted">Custom print request {quote.id}</p>
        <div className="mt-6">
          <Timeline steps={STEPS} current={0} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/track-order?order=HO-2026-10517"><Button variant="outline">Open full tracking</Button></Link>
          <Link href="/account/orders"><Button>My orders</Button></Link>
        </div>
      </div>
    </div>
  );
}
