// Mirrors how courier aggregators (NimbusPost, Shiprocket, Delhivery) and
// marketplaces (Amazon, Flipkart) bill a shipment: each item has a dead
// (actual) weight and a volumetric (dimensional) weight derived from its
// packed box size, and the courier charges whichever is greater — a large,
// light item (e.g. a lampshade) can cost more to ship than its scale reads on
// a weighing machine, because it occupies more space in the vehicle.
//
// Volumetric weight (kg) = (L x B x H in cm) / 5000 — the standard domestic
// India air/surface divisor used by NimbusPost and most Indian couriers.
const VOLUMETRIC_DIVISOR = 5000;

// Used when a product has no weight/dimensions recorded yet (e.g. older
// catalog entries added before the admin shipping-dimensions fields existed).
export const DEFAULT_ITEM_WEIGHT_KG = 0.5;
export const DEFAULT_ITEM_DIM_CM = 10;

export type ShippableLine = {
  qty: number;
  weightKg?: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
};

export function volumetricWeightKg(lengthCm?: number, breadthCm?: number, heightCm?: number): number {
  if (!lengthCm || !breadthCm || !heightCm) return 0;
  return (lengthCm * breadthCm * heightCm) / VOLUMETRIC_DIVISOR;
}

// Chargeable weight for one line: each unit is treated as packed separately
// (no multi-item bin-packing), which is the same simplification most
// small-to-mid sellers' courier integrations use — true box-consolidation
// needs a packing algorithm and multi-box shipments, which is overkill until
// order volume justifies it.
export function lineChargeableWeightKg(line: ShippableLine): number {
  const actual = line.weightKg && line.weightKg > 0 ? line.weightKg : DEFAULT_ITEM_WEIGHT_KG;
  const volumetric = volumetricWeightKg(line.lengthCm, line.breadthCm, line.heightCm);
  return Math.max(actual, volumetric) * line.qty;
}

// Chargeable weight for a whole cart/order — the figure to send to a courier
// for a delivery estimate or shipment booking.
export function cartChargeableWeightKg(lines: ShippableLine[]): number {
  return lines.reduce((sum, line) => sum + lineChargeableWeightKg(line), 0);
}

// Package dimensions for the whole order, for couriers (Skyfleet) that need
// one L/W/H per shipment rather than a chargeable weight alone. Takes the
// largest dimension seen in each axis across all lines as a conservative
// single-box approximation — true multi-box packing is the same overkill
// noted above for per-line weight.
export function cartPackageDimensionsCm(lines: ShippableLine[]): { lengthCm: number; widthCm: number; heightCm: number } {
  const lengthCm = Math.max(DEFAULT_ITEM_DIM_CM, ...lines.map((l) => l.lengthCm ?? 0));
  const widthCm = Math.max(DEFAULT_ITEM_DIM_CM, ...lines.map((l) => l.breadthCm ?? 0));
  const heightCm = Math.max(DEFAULT_ITEM_DIM_CM, ...lines.map((l) => l.heightCm ?? 0));
  return { lengthCm, widthCm, heightCm };
}
