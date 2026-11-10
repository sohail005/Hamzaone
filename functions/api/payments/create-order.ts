import { getProduct } from "../../../data/products";
import { getRazorpayCredentials, isRecord, jsonError, readJson } from "./_shared";

type CheckoutLine = {
  productSlug: string;
  qty: number;
  color: string;
  size: string;
  engraving?: string;
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

export const onRequestPost: PagesFunction = async (context) => {
  const credentials = getRazorpayCredentials(context.env);
  if (!credentials.ok) return jsonError(credentials.error, 503);

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  if (!isRecord(body)) return jsonError("Invalid checkout details.", 400);

  const lines = parseCheckoutLines(body.items);
  if (!lines || (body.shippingMethod !== "standard" && body.shippingMethod !== "express")) {
    return jsonError("Invalid checkout items or shipping method.", 400);
  }

  let subtotal = 0;
  const itemSummary: string[] = [];
  for (const line of lines) {
    const product = getProduct(line.productSlug);
    if (!product || product.availability === "out-of-stock") {
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
    if (
      product.unavailableCombo?.color === line.color &&
      product.unavailableCombo.size === line.size
    ) {
      return jsonError("A selected product variant is unavailable.", 400);
    }
    if (line.engraving !== undefined && !/^[a-zA-Z0-9 &.-]{1,12}$/.test(line.engraving)) {
      return jsonError("Engraving must be 1–12 supported characters.", 400);
    }

    const unitPrice = line.size === "Large" && product.largePrice ? product.largePrice : product.price;
    subtotal += (unitPrice + (line.engraving ? 99 : 0)) * line.qty;
    itemSummary.push(`${product.name} x${line.qty}`);
  }

  const shipping = body.shippingMethod === "express" ? 149 : subtotal >= 1499 ? 0 : 79;
  const totalPaise = (subtotal + shipping) * 100;
  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100 || totalPaise > 50_000_000) {
    return jsonError("The checkout total is outside the supported range.", 400);
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: credentials.authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: `h1_${crypto.randomUUID().replace(/-/g, "")}`,
        notes: {
          items: itemSummary.join(", ").slice(0, 240),
          shipping: body.shippingMethod,
        },
      }),
    });
    const result = await readJson(response);
    if (response.status === 401 || response.status === 403) {
      console.error("Razorpay rejected the configured credentials.", response.status);
      return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
    }
    if (!response.ok || typeof result?.id !== "string") {
      console.error("Razorpay order creation failed.", response.status);
      return jsonError("Razorpay could not create the payment order.", 502);
    }

    return Response.json({
      keyId: credentials.keyId,
      orderId: result.id,
      amount: totalPaise,
      currency: "INR",
    });
  } catch (error) {
    console.error("Razorpay order request failed.", error);
    return jsonError("Could not reach Razorpay. Please try again.", 502);
  }
};
