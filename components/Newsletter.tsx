"use client";

import { useState } from "react";
import { Button } from "./Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="flex flex-col items-center justify-between gap-8 rounded-sheet bg-art-tile p-8 sm:p-12 sm:flex-row">
      <div className="flex-1" style={{ flexBasis: 320 }}>
        <h2 className="text-[32px] font-bold">New drops, first.</h2>
        <p className="mt-2 text-text-muted">One email when a new collection lands. No spam, unsubscribe anytime.</p>
      </div>
      {subscribed ? (
        <p role="status" className="font-semibold text-success-text" style={{ flex: "1 1 360px" }}>
          ✓ You are subscribed. Check your inbox to confirm.
        </p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "Something went wrong. Try again.");
                return;
              }
              setSubscribed(true);
            } catch {
              setError("Something went wrong. Try again.");
            } finally {
              setSubmitting(false);
            }
          }}
          className="flex flex-wrap gap-2"
          style={{ flex: "1 1 360px" }}
        >
          <label htmlFor="nl" className="sr-only">Email address</label>
          <input
            id="nl"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 flex-1 rounded-input border border-border-input bg-surface px-3.5 text-base outline-none focus:border-text"
            style={{ flexBasis: 220 }}
          />
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting ? "Subscribing…" : "Subscribe"}
          </Button>
          {error ? (
            <p role="alert" className="w-full text-sm text-error-text">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
