import Link from "next/link";
import { InfoLayout } from "./InfoLayout";

export function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <InfoLayout>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-xs italic text-text-muted">Template text — lawyer review pending.</p>
      <div className="mt-4 flex flex-col gap-3 text-sm text-text-muted">{children}</div>
      <p className="mt-6 text-sm text-text-muted">
        Questions? <Link href="/contact" className="font-semibold text-accent-text">Contact us</Link>.
      </p>
    </InfoLayout>
  );
}
