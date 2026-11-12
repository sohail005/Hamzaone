import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
export default async function SubmittedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="text-2xl font-bold">Request submitted</h1>
      <p className="text-sm text-text-muted">
        Your custom print request <span className="font-semibold text-text">{id}</span> has been received. We&apos;ll send a quote within 24 hours.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`/custom-print/quotes/${id}`}><Button>View quotation status</Button></Link>
        <Link href="/"><Button variant="outline">Back to home</Button></Link>
      </div>
    </div>
  );
}
