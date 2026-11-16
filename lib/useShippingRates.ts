"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEFAULT_FREE_SHIPPING_THRESHOLD, FALLBACK_SHIPPING, type ShippingMethod } from "@/lib/checkout-pricing";

export function useShippingRates(): { rates: Record<ShippingMethod, number>; freeShippingThreshold: number } {
  const [rates, setRates] = useState<Record<ShippingMethod, number>>(FALLBACK_SHIPPING);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD);

  useEffect(() => {
    let active = true;
    api.storeSettings
      .get()
      .then(({ settings }) => {
        if (!active) return;
        if (settings.standardShipping != null && settings.expressShipping != null) {
          setRates({ standard: settings.standardShipping, express: settings.expressShipping });
        }
        if (settings.freeShippingThreshold != null) {
          setFreeShippingThreshold(settings.freeShippingThreshold);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return { rates, freeShippingThreshold };
}
