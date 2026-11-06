"use client";

import { useCallback, useRef, useState } from "react";

export type DeliveryEstimate = {
  serviceable: boolean;
  minDays?: number;
  maxDays?: number;
  cod: boolean;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function useDeliveryEstimate() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DeliveryEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const check = useCallback(async (pincode: string) => {
    const id = ++requestId.current;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/delivery-estimate?pincode=${encodeURIComponent(pincode)}`);
      const data = await res.json();
      if (id !== requestId.current) return; // a newer check superseded this one
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Couldn't check delivery estimate.");
        setResult(null);
        return;
      }
      setResult(data as DeliveryEstimate);
      setStatus("success");
    } catch {
      if (id !== requestId.current) return;
      setStatus("error");
      setError("Couldn't check delivery estimate.");
      setResult(null);
    }
  }, []);

  return { check, status, result, error };
}
