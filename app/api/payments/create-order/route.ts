import { calculateCheckoutPricing, type ShippingMethod } from "@/lib/checkout-pricing";
import { getKV, getWorkerEnv, isRecord } from "@/lib/server/kv";
import { getRazorpayCredentials, jsonError, readJson } from "@/lib/server/payments";
import { createStoredOrder, type StoredOrder, type StoredOrderItem } from "@/lib/server/orders-store";
import { getProductBySlug } from "@/lib/server/products-store";
import { findValidCoupon } from "@/lib/server/admin-store";
import { cartChargeableWeightKg, type ShippableLine } from "@/lib/shipping";
import { checkServiceability, type SkyfleetEnvironment } from "@/lib/skyfleet";
import { getStoreSettings } from "@/lib/server/store-settings-store";

type CheckoutLine = {
  productSlug: string;
  qty: number;
  color: string;
  size: string;
  engraving?: string;
};

type Customer = { name: string; email: string; phone: string };

type ShippingAddress = {
  name: string;
  pin: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  type: "Home" | "Work";
};

function parseCheckoutLines(value: unknown): CheckoutLine[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) return null;

  const lines: CheckoutLine[] = [];
  for (const rawLine of value) {
    if (!isRecord(rawLine)) return null;
    const { productSlug, qty, color, size, engraving } = rawLine;
    if (
      typeof productSlug !== "string" ||
      typeof qty !== "number" ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 100 ||
      typeof color !== "string" ||
      typeof size !== "string" ||
      (engraving !== undefined && typeof engraving !== "string")
    ) {
      return null;
    }
    lines.push({ productSlug, qty, color, size, engraving });
  }
  return lines;
}

function parseCustomer(value: unknown): Customer | null {
  if (!isRecord(value)) return null;
  const { name, email, phone } = value;
  if (
    typeof name !== "string" ||
    name.trim().length < 1 ||
    name.trim().length > 100 ||
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^\S+@\S+\.\S+$/.test(email.trim()) ||
    typeof phone !== "string" ||
    !/^\d{10}$/.test(phone.trim())
  ) {
    return null;
  }
  return { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() };
}

function parseShippingAddress(value: unknown): ShippingAddress | null {
  if (!isRecord(value)) return null;
  const { name, pin, line1, line2, landmark, city, state, type } = value;
  if (
    typeof name !== "string" ||
    name.trim().length < 1 ||
    name.trim().length > 100 ||
    typeof pin !== "string" ||
    !/^\d{6}$/.test(pin) ||
    typeof line1 !== "string" ||
    line1.trim().length < 1 ||
    line1.trim().length > 200 ||
    (line2 !== undefined && (typeof line2 !== "string" || line2.length > 200)) ||
    (landmark !== undefined && (typeof landmark !== "string" || landmark.length > 120)) ||
    typeof city !== "string" ||
    city.trim().length < 1 ||
    city.trim().length > 100 ||
    typeof state !== "string" ||
    state.trim().length < 1 ||
    state.trim().length > 100 ||
    (type !== "Home" && type !== "Work")
  ) {
    return null;
  }
  return {
    name: name.trim(),
    pin,
    line1: line1.trim(),
    ...(typeof line2 === "string" && line2.trim() ? { line2: line2.trim() } : {}),
    ...(typeof landmark === "string" && landmark.trim() ? { landmark: landmark.trim() } : {}),
    city: city.trim(),
    state: state.trim(),
    type,
  };
}

function makeOrderId() {
  return `HO-${new Date().getUTCFullYear()}-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
}

export async function POST(request: Request) {
  const env = await getWorkerEnv();
  const ordersKV = getKV(env, "ORDERS_KV");
  if (!ordersKV) {
    return jsonError("Order storage is not configured. Bind the ORDERS_KV namespace.", 503);
  }
  const dataKV = getKV(env, "DATA_KV");
  if (!dataKV) {
    return jsonError("Catalog storage is not configured. Bind the DATA_KV namespace.", 503);
  }

  const credentials = getRazorpayCredentials(env);
  if (!credentials.ok) return jsonError(credentials.error, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  if (!isRecord(body)) return jsonError("Invalid checkout details.", 400);

  const lines = parseCheckoutLines(body.items);
  const customer = parseCustomer(body.customer);
  const address = parseShippingAddress(body.address);
  const shippingMethod = body.shippingMethod;
  const couponCode = body.couponCode;
  if (!lines || !customer || !address || (shippingMethod !== "standard" && shippingMethod !== "express")) {
    return jsonError("Invalid checkout items, customer, address, or shipping method.", 400);
  }
  if (couponCode !== undefined && couponCode !== null && typeof couponCode !== "string") {
    return jsonError("Invalid coupon code.", 400);
  }

  try {
  let subtotal = 0;
  const itemSummary: string[] = [];
  const orderItems: StoredOrderItem[] = [];
  const shippableLines: ShippableLine[] = [];
  for (const line of lines) {
    const product = await getProductBySlug(dataKV, line.productSlug);
    if (
      !product ||
      product.published === false ||
      product.availability === "out-of-stock" ||
      (product.stock !== undefined && product.stock < line.qty)
    ) {
      return jsonError("One or more products are unavailable.", 400);
    }
    if (!product.colors.some((option) => option.name === line.color)) {
      return jsonError("A selected product color is unavailable.", 400);
    }
    if (product.largePrice) {
      if (line.size !== "Small" && line.size !== "Large") {
        return jsonError("A selected product size is invalid.", 400);
      }
    } else if (line.size !== "Small" && line.size !== "Standard") {
      return jsonError("A selected product size is invalid.", 400);
    }
    if (product.unavailableCombo?.color === line.color && product.unavailableCombo.size === line.size) {
      return jsonError("A selected product variant is unavailable.", 400);
    }
    if (line.engraving !== undefined && !/^[a-zA-Z0-9 &.-]{1,12}$/.test(line.engraving)) {
      return jsonError("Engraving must be 1-12 supported characters.", 400);
    }

    const unitPrice = line.size === "Large" && product.largePrice ? product.largePrice : product.price;
    subtotal += (unitPrice + (line.engraving ? 99 : 0)) * line.qty;
    orderItems.push({
      productSlug: product.slug,
      name: product.name,
      color: line.color,
      size: line.size,
      qty: line.qty,
      unitPrice,
      ...(line.engraving ? { engraving: line.engraving } : {}),
    });
    itemSummary.push(`${product.name} x${line.qty}`);
    shippableLines.push({
      qty: line.qty,
      weightKg: product.weightKg,
      lengthCm: product.lengthCm,
      breadthCm: product.breadthCm,
      heightCm: product.heightCm,
    });
  }

  let discount = 0;
  let appliedCouponCode: string | null = null;
  if (couponCode) {
    const { coupon, error } = await findValidCoupon(dataKV, couponCode, subtotal);
    if (error) return jsonError(error, 400);
    if (coupon) {
      discount = coupon.type === "flat" ? coupon.value : Math.round(subtotal * (coupon.value / 100));
      appliedCouponCode = coupon.code;
    }
  }

  // Real courier-quoted shipping cost for this order's actual chargeable
  // weight and delivery pincode, replacing the flat ₹79/₹149 guess. Skyfleet
  // being unreachable/unconfigured must not block checkout — fall back to the
  // flat rate (calculateCheckoutPricing's default) rather than failing the order.
  let realShippingCost: number | undefined;
  try {
    const chargeableWeightKg = cartChargeableWeightKg(shippableLines);
    const serviceability = await checkServiceability(address.pin, env as SkyfleetEnvironment, chargeableWeightKg, subtotal);
    if (serviceability.serviceable) {
      realShippingCost = shippingMethod === "express" ? serviceability.expressShippingCost : serviceability.standardShippingCost;
    }
  } catch (error) {
    console.error("Skyfleet shipping quote failed; falling back to flat-rate shipping.", error);
  }

  const { standardShipping, expressShipping, freeShippingThreshold } = await getStoreSettings(dataKV);
  const fallbackRates =
    standardShipping != null && expressShipping != null
      ? { standard: standardShipping, express: expressShipping }
      : undefined;

  const pricing = calculateCheckoutPricing(
    subtotal,
    shippingMethod as ShippingMethod,
    discount,
    appliedCouponCode,
    realShippingCost,
    fallbackRates,
    freeShippingThreshold,
  );

  const totalPaise = pricing.total * 100;
  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100 || totalPaise > 50_000_000) {
    return jsonError("The checkout total is outside the supported range.", 400);
  }

  const internalOrderId = makeOrderId();
  let response: Response;
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: credentials.authorization, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: internalOrderId,
        notes: { items: itemSummary.join(", ").slice(0, 240), shipping: shippingMethod },
      }),
    });
  } catch (error) {
    console.error("Razorpay order request failed.", error);
    return jsonError("Could not reach Razorpay. Please try again.", 502);
  }

  const result = await readJson(response);
  if (response.status === 401 || response.status === 403) {
    console.error("Razorpay rejected the configured credentials.", response.status);
    return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
  }
  if (
    !response.ok ||
    typeof result?.id !== "string" ||
    result.amount !== totalPaise ||
    result.currency !== "INR" ||
    result.receipt !== internalOrderId
  ) {
    console.error("Razorpay order creation failed.", response.status);
    return jsonError("Razorpay could not create the payment order.", 502);
  }

  const now = new Date().toISOString();
  const order: StoredOrder = {
    id: internalOrderId,
    razorpayOrderId: result.id,
    customer,
    address,
    items: orderItems,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    ...(pricing.couponCode ? { couponCode: pricing.couponCode } : {}),
    shipping: pricing.shipping,
    total: pricing.total,
    currency: "INR",
    paymentStatus: "pending",
    status: "awaiting_payment",
    createdAt: now,
    updatedAt: now,
  };

  try {
    await createStoredOrder(ordersKV, order);
  } catch (error) {
    console.error("Could not persist the pending order.", error);
    return jsonError("The payment order was created but could not be saved. Please contact support before retrying.", 503);
  }

  return Response.json({
    keyId: credentials.keyId,
    orderId: result.id,
    internalOrderId,
    amount: totalPaise,
    currency: "INR",
  });
  } catch (error) {
    console.error("Checkout order creation failed.", error);
    return jsonError("Could not process checkout. Please try again.", 500);
  }
}
