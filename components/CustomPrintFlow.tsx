"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, RotateCw, ZoomIn, RefreshCw, AlertCircle, Box } from "lucide-react";
import { Button } from "./Button";
import { Field, PhoneField, Textarea } from "./Input";
import { Stepper } from "./Stepper";
import { ModelPreview, UnsupportedPreviewMessage } from "./ModelPreview";
import { api } from "@/lib/api";
import { cx } from "@/lib/format";

const PREVIEWABLE_EXTENSIONS = ["stl", "3mf"];

type Materials = Record<string, { colors: string[]; finishes: string[] }>;

const STEPS = [
  { key: "upload", label: "Upload & Preview" },
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
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [continueBlocked, setContinueBlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState<Materials>({});
  const [materialsLoaded, setMaterialsLoaded] = useState(false);

  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [finish, setFinish] = useState("");

  useEffect(() => {
    api.customPrint.list("materials").then(({ materials }: { materials: Materials }) => {
      setMaterials(materials);
      const firstKey = Object.keys(materials)[0];
      if (firstKey) {
        setMaterial(firstKey);
        setColor(materials[firstKey].colors[0]);
        setFinish(materials[firstKey].finishes[0]);
      }
      setMaterialsLoaded(true);
    });
  }, []);

  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  if (!materialsLoaded) {
    return null;
  }

  function goto(key: string) {
    router.push(`/custom-print?step=${key}`);
  }

  async function uploadFile(picked: File) {
    setUploadError(null);
    setFileName(picked.name);
    setFile(picked);

    if (picked.name.toLowerCase().endsWith(".obj")) {
      setUploadState("error-obj");
      setUploadError("OBJ files are not supported. Please upload an STL, STEP or 3MF file.");
      return;
    }
    if (picked.size > 100 * 1024 * 1024) {
      setUploadState("error-size");
      setUploadError("This file is too large (over 100 MB). Please upload a smaller file.");
      return;
    }

    setUploadState("uploading");
    setProgress(0);
    try {
      await api.customPrint.upload(picked, setProgress);
      setUploadState("done");
    } catch (error) {
      setUploadState("error-network");
      setUploadError(error instanceof Error ? error.message : "Upload failed due to a network error.");
    }
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function validateContact() {
    const e: Record<string, string> = {};
    if (!contact.name) e.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(contact.phone)) e.phone = "Enter a valid 10-digit phone number.";
    setErrors(e);
    if (Object.keys(e).length === 0) goto("review");
  }

  function selectMaterial(m: string) {
    if (m === material) return;
    setMaterial(m);
    setColor(materials[m].colors[0]);
    setFinish(materials[m].finishes[0]);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-80px)] max-w-[1280px] flex-col justify-center px-4 py-8 sm:px-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold">Custom 3D print request</h1>
      </div> */}

      <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <div className="hidden md:block md:-ml-4">
          <Stepper steps={STEPS} current={step} onStepClick={goto} orientation="vertical" />
        </div>
        <div className="md:hidden">
          <Stepper steps={STEPS} current={step} onStepClick={goto} />
        </div>

      <div className="rounded-card bg-surface p-6 shadow-sm">
        {step === "upload" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Upload &amp; preview your 3D model</h2>
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
              </div>
            )}

            {uploadState === "done" && (
              <ModelPreviewPanel
                file={file}
                fileName={fileName}
                onReplace={() => fileInputRef.current?.click()}
                onRemove={() => { setUploadState("idle"); setFileName(null); setFile(null); }}
                actions={
                  <div className="flex gap-2">
                    <Link href="/custom-print"><Button variant="outline">Back</Button></Link>
                    <Button onClick={() => goto("options")}>Continue</Button>
                  </div>
                }
              />
            )}

            {(uploadState === "error-obj" || uploadState === "error-size" || uploadState === "error-network") && (
              <div className="rounded-input border border-error bg-error-tint p-5">
                <div className="flex items-center gap-2 text-error-tint-text">
                  <AlertCircle className="h-5 w-5" /> <p className="text-sm font-semibold">{uploadError}</p>
                </div>
                <div className="mt-3 flex gap-3">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Choose a different file</Button>
                  {uploadState === "error-network" && file && (
                    <Button size="sm" onClick={() => uploadFile(file)}>Retry</Button>
                  )}
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" className="hidden" onChange={onFilePicked} accept=".stl,.step,.3mf,.obj" />

            {continueBlocked && uploadState !== "done" && (
              <p className="text-sm text-error-text">Please upload a model file before continuing.</p>
            )}

            {uploadState !== "done" && (
              <div className="flex gap-2">
                <Link href="/custom-print"><Button variant="outline">Back</Button></Link>
                <Button onClick={() => setContinueBlocked(true)}>Continue</Button>
              </div>
            )}
          </div>
        )}

        {step === "options" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold">Material &amp; finish</h2>
            {Object.keys(materials).length === 0 ? (
              <p className="text-sm text-text-muted">No materials are available right now. Please check back later.</p>
            ) : (
              <>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Material</h3>
                  <div className="flex gap-2">
                    {Object.keys(materials).map((m) => (
                      <button
                        key={m}
                        onClick={() => selectMaterial(m)}
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
              </>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => goto("upload")}>Back</Button>
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
    </div>
  );
}

function ModelPreviewPanel({
  file,
  fileName,
  onReplace,
  onRemove,
  actions,
}: {
  file: File | null;
  fileName: string | null;
  onReplace: () => void;
  onRemove: () => void;
  actions?: React.ReactNode;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dims, setDims] = useState<{ x: number; y: number; z: number } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const ext = file?.name.toLowerCase().split(".").pop() ?? "";
  const kind = PREVIEWABLE_EXTENSIONS.includes(ext) ? (ext as "stl" | "3mf") : null;
  const ready = status === "ready";

  return (
    <div className="grid gap-2 md:grid-cols-[1fr_240px] md:items-start">
      <div className="relative mx-auto flex aspect-square w-full max-w-[620px] items-center justify-center overflow-hidden rounded-panel bg-art-tile">
        {file && kind ? (
          <ModelPreview
            key={`${file.name}-${file.size}-${file.lastModified}`}
            file={file}
            kind={kind}
            rotation={rotation}
            zoom={zoom}
            onDimensions={setDims}
            onStatus={setStatus}
          />
        ) : (
          <UnsupportedPreviewMessage />
        )}
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-chip bg-surface/90 px-2 py-0.5 text-[11px] text-text-muted">
          {ready ? "3D preview" : "Preview unavailable"}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-input border border-success p-2">
          <div className="flex items-center gap-2 text-success-text">
            <Box className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold break-all">{fileName} uploaded</p>
          </div>
          <div className="mt-3 flex gap-3">
            <Button size="sm" variant="outline" onClick={onReplace}>Replace</Button>
            <Button size="sm" variant="ghost" onClick={onRemove}>Remove</Button>
          </div>
        </div>

        {ready && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">View controls</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setRotation((r) => r + 45)}><RotateCw className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}><ZoomIn className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => { setRotation(0); setZoom(1); }}><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Dimensions</h3>
          <p className="text-sm text-text-muted">
            {ready
              ? dims
                ? `${dims.x.toFixed(0)} × ${dims.y.toFixed(0)} × ${dims.z.toFixed(0)} mm`
                : "Measuring dimensions…"
              : "Confirmed by our team during review."}
          </p>
        </div>

        {actions}
      </div>
    </div>
  );
}
