import Link from "next/link";
import { Upload, Palette, Printer, Truck } from "lucide-react";
import { Button } from "./Button";
import { ConceptRender } from "./ConceptRender";

export function CustomPrintLanding() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="font-display text-[40px] font-extrabold leading-tight">Your Design. Our Precision.</h1>
          <p className="mt-4 max-w-md text-lg text-text-muted">
            Upload any 3D model — STL, STEP or 3MF — and we&apos;ll quote, print and ship it to you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/custom-print?step=upload"><Button size="lg">Upload Your 3D Model</Button></Link>
            <a href="#how"><Button size="lg" variant="outline">See how it works</Button></a>
          </div>
        </div>
        <ConceptRender shape="dragon" color="#8E9097" className="aspect-square rounded-panel" />
      </div>

      <div id="how" className="mt-16">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: Upload, label: "Upload your model" },
            { icon: Palette, label: "Choose material & colour" },
            { icon: Printer, label: "We quote, print & QC" },
            { icon: Truck, label: "Delivered to your door" },
          ].map((step, i) => (
            <div key={step.label} className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-sm">
              <span className="text-xs font-semibold text-accent-text">Step {i + 1}</span>
              <step.icon className="h-6 w-6 text-accent-text" />
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-card border border-border bg-surface p-5 text-sm text-text-muted">
        Already requested a quote? <Link href="/faq" className="font-semibold text-accent-text">See how quotes work</Link>.
      </div>
    </div>
  );
}
