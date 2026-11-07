import Link from "next/link";
import { InfoLayout } from "@/components/InfoLayout";
import { Button } from "@/components/Button";

export default function AboutPage() {
  return (
    <InfoLayout>
      <h1 className="text-2xl font-bold">About HamzaOne</h1>
      <p className="mt-4 text-sm text-text-muted">
        HamzaOne designs and 3D prints ready-made home, desk and personalised goods — and prints custom models
        uploaded by customers. Every order is printed in-house in India, quality-checked, and dispatched within
        3–6 business days.
      </p>
      <p className="mt-4 text-sm text-text-muted">
        We started with a single printer and a love for good design. Today we run a small studio focused on
        craft, consistency and fast turnaround — whether you&apos;re ordering from our catalogue or sending us your
        own design.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/shop"><Button>Shop the collection</Button></Link>
        <Link href="/contact"><Button variant="outline">Talk to us</Button></Link>
      </div>
    </InfoLayout>
  );
}
