const BASE_URL = "https://api.skyfleetnow.com/api/v1";
const RATES_URL = `${BASE_URL}/rates/calculate`;
const SHIPMENTS_URL = `${BASE_URL}/shipments`;

export type SkyfleetEnvironment = {
  SKYFLEET_API_KEY?: string;
  SKYFLEET_PICKUP_PINCODE?: string;
  // POST /shipments rejects the documented `pickupAddressId` shorthand
  // (confirmed against the live API) — it needs the full pickup address
  // inline, so these mirror the saved address from GET /shipments/pickup-addresses.
  SKYFLEET_PICKUP_NAME?: string;
  SKYFLEET_PICKUP_PHONE?: string;
  SKYFLEET_PICKUP_ADDRESS?: string;
  SKYFLEET_PICKUP_CITY?: string;
  SKYFLEET_PICKUP_STATE?: string;
};

export class SkyfleetNotConfiguredError extends Error {
  constructor() {
    super("Skyfleet credentials are not configured.");
    this.name = "SkyfleetNotConfiguredError";
  }
}

export class SkyfleetApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkyfleetApiError";
  }
}

export type ServiceabilityResult = {
  serviceable: boolean;
  minDays?: number;
  maxDays?: number;
  cod: boolean;
  standardShippingCost?: number;
  expressShippingCost?: number;
};

function requireEnv(name: keyof SkyfleetEnvironment, env: SkyfleetEnvironment): string {
  const value = env[name];
  if (!value) throw new SkyfleetNotConfiguredError();
  return value;
}

function authHeaders(env: SkyfleetEnvironment): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-Key": requireEnv("SKYFLEET_API_KEY", env),
  };
}

type RateQuote = { carrierId?: string; courier?: string; totalCharge?: number; codCharge?: number; eddDays?: number };
type ApiEnvelope<T> = { success?: boolean; message?: string; errors?: unknown; data?: T };

// Pincode/route combinations Skyfleet just doesn't serve are a normal
// business outcome (caller should show "not deliverable"), not a failure —
// everything else (wallet balance, account not ready, bad request shape) is
// a real integration problem the caller should see and fall back on.
const NOT_SERVICEABLE_CODES = new Set(["PICKUP_PINCODE_NOT_SERVICEABLE", "DROP_PINCODE_NOT_SERVICEABLE", "PRICING_NOT_AVAILABLE"]);

function errorCode(body: unknown): string | undefined {
  if (body && typeof body === "object" && "code" in body && typeof (body as Record<string, unknown>).code === "string") {
    return (body as Record<string, unknown>).code as string;
  }
  return undefined;
}

export async function checkServiceability(
  deliveryPincode: string,
  env: SkyfleetEnvironment,
  weightKg = 0.5,
  orderAmount = 500,
): Promise<ServiceabilityResult> {
  const pickupPincode = requireEnv("SKYFLEET_PICKUP_PINCODE", env);
  const headers = authHeaders(env);

  const res = await fetch(RATES_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      pickupPincode,
      dropPincode: deliveryPincode,
      weightGrams: Math.max(1, Math.round(weightKg * 1000)),
      paymentMode: "PREPAID",
      lengthCm: 10,
      breadthCm: 10,
      heightCm: 10,
      invoiceValue: orderAmount,
    }),
  });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<RateQuote[]> | null;

  if (!res.ok || !body?.success) {
    if (NOT_SERVICEABLE_CODES.has(errorCode(body) ?? "")) {
      return { serviceable: false, cod: false };
    }
    throw new SkyfleetApiError(body?.message || `Skyfleet rate check failed (${res.status}).`);
  }

  const quotes = Array.isArray(body.data) ? body.data : [];
  if (quotes.length === 0) {
    return { serviceable: false, cod: false };
  }

  const charges = quotes.map((q) => q.totalCharge).filter((v): v is number => typeof v === "number");
  const days = quotes.map((q) => q.eddDays).filter((v): v is number => typeof v === "number");

  return {
    serviceable: true,
    minDays: days.length ? Math.min(...days) : undefined,
    maxDays: days.length ? Math.max(...days) : undefined,
    // This call always quotes paymentMode PREPAID (the only mode this store
    // supports), so codCharge in the response is always 0 and doesn't signal
    // real COD availability — hardcoded false rather than a misleading guess.
    cod: false,
    standardShippingCost: charges.length ? Math.round(Math.min(...charges)) : undefined,
    expressShippingCost: charges.length ? Math.round(Math.min(...charges)) : undefined,
  };
}

export type ShipmentConsignee = {
  name: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export type ShipmentItem = {
  name: string;
  qty: number;
  price: number;
  sku?: string;
};

export type CreateShipmentInput = {
  orderNumber: string;
  orderAmount: number;
  packageWeightGrams: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  consignee: ShipmentConsignee;
  items: ShipmentItem[];
};

export type ShipmentResult = {
  awbNumber: string;
  courierName: string;
  labelUrl?: string;
};

type BookedShipment = {
  id?: string;
  status?: string;
  awbNumber?: string | null;
  courier?: string | null;
  labelUrl?: string | null;
};
type BookingResult = { status?: string; error?: string; code?: string };

// Creates and books the shipment in one call (book: true, no carrierId —
// Skyfleet auto-allocates a courier) and returns the AWB it generated. A
// response can be "success: true" (the shipment record was created) while
// booking itself still failed (e.g. KYC pending, no wallet balance) — that
// shows up as data.booking.status === "failed" with no awbNumber, which we
// must surface as the real error rather than a generic "missing AWB".
export async function createShipment(input: CreateShipmentInput, env: SkyfleetEnvironment): Promise<ShipmentResult> {
  const headers = authHeaders(env);
  const pickup = {
    name: requireEnv("SKYFLEET_PICKUP_NAME", env),
    phone: requireEnv("SKYFLEET_PICKUP_PHONE", env),
    address: requireEnv("SKYFLEET_PICKUP_ADDRESS", env),
    city: requireEnv("SKYFLEET_PICKUP_CITY", env),
    state: requireEnv("SKYFLEET_PICKUP_STATE", env),
    pincode: requireEnv("SKYFLEET_PICKUP_PINCODE", env),
  };

  const payload = {
    shipmentType: "FORWARD",
    paymentMode: "PREPAID",
    orderReferenceNumber: input.orderNumber,
    invoiceValue: input.orderAmount,
    pickup,
    book: true,
    drop: {
      name: input.consignee.name,
      phone: input.consignee.phone,
      address: [input.consignee.address, input.consignee.address2].filter(Boolean).join(", "),
      city: input.consignee.city,
      state: input.consignee.state,
      pincode: input.consignee.pincode,
    },
    packages: [
      {
        weightGrams: Math.max(1, Math.round(input.packageWeightGrams)),
        lengthCm: input.packageLengthCm,
        breadthCm: input.packageWidthCm,
        heightCm: input.packageHeightCm,
        items: input.items.map((item) => ({
          name: item.name,
          sku: item.sku ?? "",
          quantity: item.qty,
          unitPrice: item.price,
        })),
      },
    ],
  };

  const res = await fetch(SHIPMENTS_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  const body = (await res.json().catch(() => null)) as
    | ApiEnvelope<{ shipment?: BookedShipment; booking?: BookingResult }>
    | null;

  if (!res.ok || !body?.success) {
    throw new SkyfleetApiError(body?.message || `Skyfleet shipment creation failed (${res.status}).`);
  }

  const shipment = body.data?.shipment;
  const booking = body.data?.booking;
  if (booking?.status === "failed") {
    throw new SkyfleetApiError(booking.error || "Skyfleet booking failed.");
  }
  if (!shipment || typeof shipment.awbNumber !== "string") {
    throw new SkyfleetApiError("Skyfleet shipment response was missing an AWB number.");
  }

  return {
    awbNumber: shipment.awbNumber,
    courierName: shipment.courier ?? "Unknown",
    ...(shipment.labelUrl ? { labelUrl: shipment.labelUrl } : {}),
  };
}
