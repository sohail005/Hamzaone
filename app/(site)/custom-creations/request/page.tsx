import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestForm } from "@/components/CustomCreations/RequestForm";

export const metadata: Metadata = { title: "Create Your Custom Request", robots: { index: false, follow: false } };

export default function CustomCreationsRequestPage() {
  return (
    <Suspense>
      <RequestForm />
    </Suspense>
  );
}
