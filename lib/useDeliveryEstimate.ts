"use client";

import { useCallback, useState } from "react";

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

  const check = useCallback(async (pincode: string) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/delivery-estimate?pincode=${encodeURIComponent(pincode)}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Couldn't check delivery estimate.");
        setResult(null);
        return;
      }
      setResult(data as DeliveryEstimate);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Couldn't check delivery estimate.");
      setResult(null);
    }
  }, []);

  return { check, status, result, error };
}
