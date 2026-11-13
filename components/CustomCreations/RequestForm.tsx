"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { Field, Textarea, PhoneField } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { cx } from "@/lib/format";
import { CUSTOM_CREATION_CATEGORIES, CUSTOM_CREATION_COLORS } from "@/data/customCreations";
import { ImageUploader, type UploadedImage } from "./ImageUploader";

const STEPS = [
  { key: "customer", label: "Your details" },
  { key: "project", label: "Project" },
  { key: "additional", label: "More info" },
  { key: "review", label: "Review" },
];

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  projectName: string;
  category: string;
  description: string;
  lengthMm: string;
  widthMm: string;
  heightMm: string;
  dimensionsNotSure: boolean;
  quantity: string;
  preferredColor: string;
  customColorDescription: string;
  finishingRequirement: string;
  intendedPurpose: string;
  expectedBudget: string;
  requiredByDate: string;
  additionalInstructions: string;
  consent: boolean;
};

function emptyState(initialCategory: string): FormState {
  return {
    customerName: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    projectName: "",
    category: initialCategory,
    description: "",
    lengthMm: "",
    widthMm: "",
    heightMm: "",
    dimensionsNotSure: false,
    quantity: "1",
    preferredColor: "",
    customColorDescription: "",
    finishingRequirement: "",
    intendedPurpose: "",
    expectedBudget: "",
    requiredByDate: "",
    additionalInstructions: "",
    consent: false,
  };
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function RequestForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(() => emptyState(params.get("category") ?? ""));
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(index: number): FieldErrors {
    const errors: FieldErrors = {};
    if (index === 0) {
      if (!form.customerName.trim()) errors.customerName = "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Please enter a valid email address.";
      if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = "Please enter a valid 10-digit phone number.";
      if (!form.deliveryCity.trim()) errors.deliveryCity = "Please enter your city.";
      if (!form.deliveryState.trim()) errors.deliveryState = "Please enter your state.";
      if (!/^\d{6}$/.test(form.deliveryPincode.trim())) errors.deliveryPincode = "Please enter a valid 6-digit PIN code.";
    }
    if (index === 1) {
      if (!form.category) errors.category = "Please choose a category.";
      if (form.description.trim().length < 10) errors.description = "Please describe your project in a bit more detail.";
      if (!form.dimensionsNotSure && !form.lengthMm) errors.lengthMm = "Required, or mark \"not sure\".";
      if (!form.dimensionsNotSure && !form.widthMm) errors.widthMm = "Required, or mark \"not sure\".";
      if (!form.dimensionsNotSure && !form.heightMm) errors.heightMm = "Required, or mark \"not sure\".";
      if (!form.quantity || Number(form.quantity) < 1) errors.quantity = "Please enter a valid quantity.";
    }
    if (index === 3 && !form.consent) {
      errors.consent = "Please confirm the consent checkbox before submitting.";
    }
    return errors;
  }

  function goNext() {
    const errors = validateStep(stepIndex);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields below.");
      return;
    }
    setError(null);
    setFieldErrors({});
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function goBack() {
    setError(null);
    setFieldErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function submit() {
    const errors = validateStep(3);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields below.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { requestNumber } = await api.customCreations.create({
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        deliveryCity: form.deliveryCity.trim(),
        deliveryState: form.deliveryState.trim(),
        deliveryPincode: form.deliveryPincode.trim(),
        projectName: form.projectName.trim() || undefined,
        category: form.category,
        description: form.description.trim(),
        lengthMm: form.dimensionsNotSure ? undefined : Number(form.lengthMm),
        widthMm: form.dimensionsNotSure ? undefined : Number(form.widthMm),
        heightMm: form.dimensionsNotSure ? undefined : Number(form.heightMm),
        dimensionsNotSure: form.dimensionsNotSure,
        quantity: Number(form.quantity),
        preferredColor: form.preferredColor || undefined,
        customColorDescription: form.customColorDescription.trim() || undefined,
        finishingRequirement: form.finishingRequirement.trim() || undefined,
        intendedPurpose: form.intendedPurpose.trim() || undefined,
        expectedBudget: form.expectedBudget ? Number(form.expectedBudget) : undefined,
        requiredByDate: form.requiredByDate || undefined,
        additionalInstructions: form.additionalInstructions.trim() || undefined,
        consent: form.consent,
        images: images.map(({ storageKey, originalFilename, mimeType, fileSize }) => ({ storageKey, originalFilename, mimeType, fileSize })),
      });
      router.push(`/custom-creations/submitted/${requestNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit your request. Please try again.");
      setSubmitting(false);
    }
  }

  const category = CUSTOM_CREATION_CATEGORIES.find((c) => c.slug === form.category);

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Create Your Custom Request</h1>
      <div className="mt-6">
        <Stepper steps={STEPS} current={STEPS[stepIndex].key} onStepClick={(key) => setStepIndex(STEPS.findIndex((s) => s.key === key))} />
      </div>

      <div className="mt-8 flex flex-col gap-5 rounded-card bg-surface p-6 shadow-sm">
        {stepIndex === 0 && (
          <>
            <Field id="customerName" label="Full name" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} error={fieldErrors.customerName} />
            <Field id="email" label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} error={fieldErrors.email} />
            <PhoneField id="phone" label="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} error={fieldErrors.phone} />
            <PhoneField
              id="whatsapp"
              label="WhatsApp number (optional)"
              value={form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="city" label="City" value={form.deliveryCity} onChange={(e) => update("deliveryCity", e.target.value)} error={fieldErrors.deliveryCity} />
              <Field id="state" label="State" value={form.deliveryState} onChange={(e) => update("deliveryState", e.target.value)} error={fieldErrors.deliveryState} />
              <Field id="pincode" label="PIN code" value={form.deliveryPincode} onChange={(e) => update("deliveryPincode", e.target.value.replace(/\D/g, "").slice(0, 6))} error={fieldErrors.deliveryPincode} />
            </div>
          </>
        )}

        {stepIndex === 1 && (
          <>
            <Field id="projectName" label="Project name (optional)" value={form.projectName} onChange={(e) => update("projectName", e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-sm font-semibold text-text">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={cx(
                  "h-12 rounded-[12px] border bg-surface px-4 text-[16px] text-text",
                  fieldErrors.category ? "border-2 border-error" : "border-border-input focus:border-accent",
                )}
              >
                <option value="">Select a category</option>
                {CUSTOM_CREATION_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {fieldErrors.category && <p className="text-sm text-error-text">{fieldErrors.category}</p>}
            </div>
            <Textarea id="description" label="Detailed description" value={form.description} onChange={(e) => update("description", e.target.value)} error={fieldErrors.description} />
            <ImageUploader images={images} onChange={setImages} />

            <div className="flex items-center justify-between rounded-input border border-border p-3">
              <span className="text-sm font-medium">I&apos;m not sure about dimensions</span>
              <Toggle checked={form.dimensionsNotSure} onChange={() => update("dimensionsNotSure", !form.dimensionsNotSure)} label="Not sure about dimensions" />
            </div>
            {!form.dimensionsNotSure && (
              <div className="grid grid-cols-3 gap-4">
                <Field id="lengthMm" label="Length (mm)" type="number" value={form.lengthMm} onChange={(e) => update("lengthMm", e.target.value)} error={fieldErrors.lengthMm} />
                <Field id="widthMm" label="Width (mm)" type="number" value={form.widthMm} onChange={(e) => update("widthMm", e.target.value)} error={fieldErrors.widthMm} />
                <Field id="heightMm" label="Height (mm)" type="number" value={form.heightMm} onChange={(e) => update("heightMm", e.target.value)} error={fieldErrors.heightMm} />
              </div>
            )}
            <Field id="quantity" label="Quantity" type="number" min={1} value={form.quantity} onChange={(e) => update("quantity", e.target.value)} error={fieldErrors.quantity} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="color" className="text-sm font-semibold text-text">Preferred color</label>
              <select
                id="color"
                value={form.preferredColor}
                onChange={(e) => update("preferredColor", e.target.value)}
                className="h-12 rounded-[12px] border border-border-input bg-surface px-4 text-[16px] text-text focus:border-accent"
              >
                <option value="">No preference</option>
                {CUSTOM_CREATION_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {form.preferredColor === "Custom (describe below)" && (
              <Field id="customColor" label="Describe the color" value={form.customColorDescription} onChange={(e) => update("customColorDescription", e.target.value)} />
            )}
            <Field id="finishing" label="Finishing requirements (optional)" value={form.finishingRequirement} onChange={(e) => update("finishingRequirement", e.target.value)} />
          </>
        )}

        {stepIndex === 2 && (
          <>
            <Field id="purpose" label="Intended purpose (optional)" value={form.intendedPurpose} onChange={(e) => update("intendedPurpose", e.target.value)} />
            <Field id="budget" label="Expected budget in ₹ (optional)" type="number" value={form.expectedBudget} onChange={(e) => update("expectedBudget", e.target.value)} />
            <Field id="requiredBy" label="Required-by date (optional)" type="date" value={form.requiredByDate} onChange={(e) => update("requiredByDate", e.target.value)} />
            <Textarea id="additional" label="Additional instructions (optional)" value={form.additionalInstructions} onChange={(e) => update("additionalInstructions", e.target.value)} />
          </>
        )}

        {stepIndex === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Review your request</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-text-muted">Name</dt><dd className="font-medium">{form.customerName}</dd></div>
              <div><dt className="text-text-muted">Email</dt><dd className="font-medium">{form.email}</dd></div>
              <div><dt className="text-text-muted">Phone</dt><dd className="font-medium">{form.phone}</dd></div>
              <div><dt className="text-text-muted">Delivery</dt><dd className="font-medium">{form.deliveryCity}, {form.deliveryState} {form.deliveryPincode}</dd></div>
              <div><dt className="text-text-muted">Project</dt><dd className="font-medium">{form.projectName || "—"}</dd></div>
              <div><dt className="text-text-muted">Category</dt><dd className="font-medium">{category?.name ?? form.category}</dd></div>
              <div><dt className="text-text-muted">Quantity</dt><dd className="font-medium">{form.quantity}</dd></div>
              <div><dt className="text-text-muted">Dimensions</dt><dd className="font-medium">{form.dimensionsNotSure ? "Not sure" : `${form.lengthMm} x ${form.widthMm} x ${form.heightMm} mm`}</dd></div>
              <div><dt className="text-text-muted">Color</dt><dd className="font-medium">{form.preferredColor || "No preference"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-text-muted">Description</dt><dd className="font-medium">{form.description}</dd></div>
              <div className="sm:col-span-2"><dt className="text-text-muted">Reference images</dt><dd className="font-medium">{images.length} uploaded</dd></div>
            </dl>

            <label className={cx("flex items-start gap-2 text-sm", fieldErrors.consent && "text-error-text")}>
              <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-0.5" />
              <span>
                I confirm that the information and reference images submitted are accurate, and I understand that final design feasibility,
                pricing, and production timelines will be confirmed by HamzaOne.
              </span>
            </label>
            {fieldErrors.consent && <p className="text-sm text-error-text">{fieldErrors.consent}</p>}
          </div>
        )}

        {error && <p className="text-sm text-error-text">{error}</p>}

        <div className="mt-2 flex items-center justify-between">
          <Button variant="outline" onClick={goBack} disabled={stepIndex === 0 || submitting}>Back</Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button onClick={goNext}>Continue</Button>
          ) : (
            <Button onClick={submit} loading={submitting}>Submit Custom Request</Button>
          )}
        </div>
      </div>
    </div>
  );
}
