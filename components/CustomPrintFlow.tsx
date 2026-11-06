"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, RotateCw, ZoomIn, RefreshCw, AlertCircle, Loader2, Box } from "lucide-react";
import { Button } from "./Button";
import { Field, PhoneField, Textarea } from "./Input";
import { Stepper } from "./Stepper";
import { materials } from "@/data/customPrint";
import { cx } from "@/lib/format";

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "options", label: "Options" },
  { key: "contact", label: "Contact" },
  { key: "review", label: "Review" },
];

type UploadState = "idle" | "uploading" | "done" | "error-obj" | "error-size" | "error-network";

export function CustomPrintFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const step = params.get("step") ?? "upload";

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [continueBlocked, setContinueBlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [material, setMaterial] = useState<"PLA" | "PETG" | "TPU">("PLA");
  const [color, setColor] = useState(materials.PLA.colors[0]);
  const [finish, setFinish] = useState(materials.PLA.finishes[0]);

  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  function goto(key: string) {
    router.push(`/custom-print?step=${key}`);
  }

  function simulateUpload(file: File) {
    setUploadError(null);
    setFileName(file.name);

    if (file.name.toLowerCase().endsWith(".obj")) {
      setUploadState("error-obj");
      setUploadError("OBJ files are not supported. Please upload an STL, STEP or 3MF file.");
      return;
    }
    if (file.size > 140 * 1024 * 1024) {
      setUploadState("error-size");
      setUploadError("This file is too large (over 140 MB). Please upload a smaller file.");
      return;
    }

    setUploadState("uploading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploadState("done");
          return 100;
        }
        return p + 20;
      });
    }, 200);
  }

  function simulateNetworkFailure() {
    setUploadState("error-network");
    setUploadError("Upload failed due to a network error.");
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file);
  }

  function validateContact() {
    const e: Record<string, string> = {};
    if (!contact.name) e.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(contact.phone)) e.phone = "Enter a valid 10-digit phone number.";
    setErrors(e);
    if (Object.keys(e).length === 0) goto("review");
  }

  useEffect(() => {
    if (material === "PLA") { setColor(materials.PLA.colors[0]); setFinish(materials.PLA.finishes[0]); }
    if (material === "PETG") { setColor(materials.PETG.colors[0]); setFinish(materials.PETG.finishes[0]); }
    if (material === "TPU") { setColor(materials.TPU.colors[0]); setFinish(materials.TPU.finishes[0]); }
  }, [material]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold">Custom 3D print request</h1>
      </div>
      <div className="mt-6">
        <Stepper steps={STEPS} current={step} onStepClick={goto} />
      </div>

      <div className="mt-8 rounded-card bg-surface p-6 shadow-sm">
        {step === "upload" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Upload your 3D model</h2>
            <p className="text-sm text-text-muted">Accepted formats: STL, STEP, 3MF. Max file size 100 MB.</p>

            {uploadState === "idle" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-input border-2 border-dashed border-border-input bg-bg px-6 py-12 text-text-muted hover:border-accent"
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm font-semibold">Click to choose a file</span>
                <span className="text-xs">or drag and drop here</span>
              </button>
            )}

            {uploadState === "uploading" && (
              <div className="rounded-input border border-border p-5">
                <p className="text-sm font-semibold">{fileName}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-text-muted">Uploading… {progress}%</p>
                <button onClick={simulateNetworkFailure} className="mt-2 text-xs text-error-text underline">
                  Prototype: simulate network failure
                </button>
              </div>
            )}

            {uploadState === "done" && (
              <div className="rounded-input border border-success p-5">
                <div className="flex items-center gap-2 text-success-text">
                  <Box className="h-5 w-5" /> <p className="text-sm font-semibold">{fileName} uploaded</p>
                </div>
                <div className="mt-3 flex gap-3">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Replace</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setUploadState("idle"); setFileName(null); }}>Remove</Button>
                </div>
              </div>
            )}

            {(uploadState === "error-obj" || uploadState === "error-size" || uploadState === "error-network") && (
              <div className="rounded-input border border-error bg-error-tint p-5">
                <div className="flex items-center gap-2 text-error-tint-text">
                  <AlertCircle className="h-5 w-5" /> <p className="text-sm font-semibold">{uploadError}</p>
                </div>
                <div className="mt-3 flex gap-3">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Choose a different file</Button>
                  {uploadState === "error-network" && fileName && (
                    <Button size="sm" onClick={() => simulateUpload(new File([""], fileName))}>Retry</Button>
                  )}
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" className="hidden" onChange={onFilePicked} accept=".stl,.step,.3mf,.obj" />

            {continueBlocked && uploadState !== "done" && (
              <p className="text-sm text-error-text">Please upload a model file before continuing.</p>
            )}

            <div className="flex gap-2">
              <Link href="/custom-print"><Button variant="outline">Back</Button></Link>
              <Button
                onClick={() => {
                  if (uploadState !== "done") { setContinueBlocked(true); return; }
                  goto("preview");
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <PreviewStep onBack={() => goto("upload")} onContinue={() => goto("options")} />
        )}

        {step === "options" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">Material &amp; finish</h2>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Material</h3>
              <div className="flex gap-2">
                {(["PLA", "PETG", "TPU"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaterial(m)}
                    className={cx("rounded-full border px-4 py-2 text-sm font-medium", material === m ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input")}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Colour</h3>
              <div className="flex flex-wrap gap-2">
                {materials[material].colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cx("rounded-full border px-4 py-2 text-sm font-medium", color === c ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Finish</h3>
              <div className="flex flex-wrap gap-2">
                {materials[material].finishes.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinish(f)}
                    className={cx("rounded-full border px-4 py-2 text-sm font-medium", finish === f ? "border-accent bg-mto-chip-bg text-accent-text" : "border-border-input")}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => goto("preview")}>Back</Button>
              <Button onClick={() => goto("contact")}>Continue</Button>
            </div>
          </div>
        )}

        {step === "contact" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Your contact details</h2>
            <Field id="cp-name" label="Full name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} error={errors.name} />
            <Field id="cp-email" label="Email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} error={errors.email} />
            <PhoneField id="cp-phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} error={errors.phone} />
            <Textarea id="cp-notes" label="Notes for our team (optional)" value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => goto("options")}>Back</Button>
              <Button onClick={validateContact}>Continue</Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">Review your request</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">File</h3>
                <p className="text-sm text-text-muted">{fileName ?? "model.stl"}</p>
              </div>
              <button onClick={() => goto("upload")} className="text-xs font-semibold text-accent-text">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Material &amp; finish</h3>
                <p className="text-sm text-text-muted">{material} · {color} · {finish}</p>
              </div>
              <button onClick={() => goto("options")} className="text-xs font-semibold text-accent-text">Edit</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Contact</h3>
                <p className="text-sm text-text-muted">{contact.name} · {contact.email} · {contact.phone}</p>
              </div>
              <button onClick={() => goto("contact")} className="text-xs font-semibold text-accent-text">Edit</button>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              I understand my model will be reviewed and a quote shared within 24 hours before any payment is taken.
            </label>
            <Button disabled={!consent} size="lg" onClick={() => router.push("/custom-print/submitted/CPR-2611-0738")}>
              Submit Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Preview</h2>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-panel bg-art-tile">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        ) : fallback ? (
          <div className="text-center text-sm text-text-muted">
            <Box className="mx-auto mb-2 h-10 w-10" />
            Preview unavailable — your file was received and will be reviewed by our team.
          </div>
        ) : (
          <div
            className="h-40 w-40 rounded-[18%] bg-[#8E9097] shadow-[inset_0_6px_14px_rgba(0,0,0,0.15)] transition-transform"
            style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
          />
        )}
        <span className="absolute bottom-3 right-3 rounded-chip bg-surface/90 px-2 py-0.5 text-[11px] text-text-muted">
          Concept render
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setRotation((r) => r + 45)}><RotateCw className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.min(2, z + 0.2))}><ZoomIn className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => { setRotation(0); setZoom(1); }}><RefreshCw className="h-4 w-4" /></Button>
        </div>
        <button onClick={() => setFallback((f) => !f)} className="text-xs text-text-muted underline">
          Prototype: toggle fallback state
        </button>
      </div>
      <p className="text-sm text-text-muted">Estimated dimensions: 82 × 46 × 30 mm</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}
