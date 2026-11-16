"use client";

import { useState } from "react";
import { InfoLayout } from "@/components/InfoLayout";
import { Field, Textarea } from "@/components/Input";
import { Button } from "@/components/Button";
import { MailCheck } from "lucide-react";
import { SUPPORT_EMAIL, whatsAppLink } from "@/data/site";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const waLink = whatsAppLink("Hi HamzaOne, I have a question about my order.");

  if (sent) {
    return (
      <InfoLayout>
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-8 text-center shadow-sm">
          <MailCheck className="h-10 w-10 text-success" />
          <h1 className="text-xl font-bold">Message sent</h1>
          <p className="text-sm text-text-muted">Thanks, {form.name || "there"} — we&apos;ll get back to you within 1 business day.</p>
        </div>
      </InfoLayout>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <InfoLayout>
      <h1 className="text-2xl font-bold">Contact us</h1>
      <p className="mt-2 text-sm text-text-muted">
        Support: <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>
        {waLink && (
          <>
            {" "}· <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>
          </>
        )}
      </p>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4 rounded-card bg-surface p-5 shadow-sm">
        <Field id="name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Field id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Textarea id="message" label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        {error && <p role="alert" className="text-sm text-error-text">{error}</p>}
        <Button type="submit" className="self-start" disabled={submitting}>{submitting ? "Sending…" : "Send message"}</Button>
      </form>
    </InfoLayout>
  );
}
