import type { CloudflareEnv, KVStore } from "@/lib/server/kv";
import type { EmailEnv } from "@/lib/server/email";
import { updateStoredOrder, type StoredOrder } from "@/lib/server/orders-store";
import { incrementCouponUsage, recordOrderInventoryUsage } from "@/lib/server/admin-store";
import { sendOrderConfirmedEmail, notifyAdminNewOrder } from "@/lib/server/email-templates/orders";
import { getProductBySlug } from "@/lib/server/products-store";
import { cartChargeableWeightKg, type ShippableLine } from "@/lib/shipping";
import { createShipment, NimbusPostNotConfiguredError, type NimbusPostEnvironment } from "@/lib/nimbuspost";

// Resolves each line's packed weight from the product catalog (falling back
// to the DEFAULT_ITEM_WEIGHT_KG lib/shipping.ts already uses when a product
// has no recorded weight, e.g. a custom-creation order with no catalog slug)
// and books a courier AWB for the whole order in one NimbusPost call.
async function createNimbusShipment(env: NimbusPostEnvironment, dataKV: KVStore | null, order: StoredOrder) {
  const shippableLines: ShippableLine[] = await Promise.all(
    order.items.map(async (item) => {
      const product = dataKV ? await getProductBySlug(dataKV, item.productSlug) : null;
      return {
        qty: item.qty,
        weightKg: product?.weightKg,
        lengthCm: product?.lengthCm,
        breadthCm: product?.breadthCm,
        heightCm: product?.heightCm,
      };
    }),
  );
  const packageWeightGrams = cartChargeableWeightKg(shippableLines) * 1000;

  return createShipment(
    {
      orderNumber: order.id.slice(-20),
      paymentType: "prepaid",
      orderAmount: order.total,
      shippingCharges: order.shipping,
      discount: order.discount,
      packageWeightGrams,
      consignee: {
        name: order.address.name,
        address: order.address.line1,
        address2: [order.address.line2, order.address.landmark].filter(Boolean).join(", ") || undefined,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pin,
        phone: order.customer.phone,
      },
      items: order.items.map((item) => ({ name: item.name, qty: item.qty, price: item.unitPrice, sku: item.productSlug })),
    },
    env,
  );
}

// Shared "payment just got confirmed" side effects for a normal product order
// (verify-payment, the webhook, and the admin recheck-payment endpoint all
// transition an order into paid/confirmed exactly once and must apply the
// same side effects — coupon usage, inventory, notifications).
export async function fulfillPaidOrder(
  env: CloudflareEnv & EmailEnv,
  ordersKV: KVStore,
  dataKV: KVStore | null,
  order: StoredOrder,
  paymentId: string,
): Promise<StoredOrder> {
  const now = new Date().toISOString();
  let updated: StoredOrder = {
    ...order,
    razorpayPaymentId: paymentId,
    paymentStatus: "paid",
    status: "confirmed",
    paidAt: now,
    updatedAt: now,
  };
  await updateStoredOrder(ordersKV, updated);

  if (dataKV) {
    await Promise.all([
      order.couponCode
        ? incrementCouponUsage(dataKV, order.couponCode).catch((error) => console.error("Could not increment coupon usage.", error))
        : Promise.resolve(),
      recordOrderInventoryUsage(
        dataKV,
        order.items.map((item) => ({ slug: item.productSlug, color: item.color, size: item.size, qty: item.qty })),
      ).catch((error) => console.error("Could not record inventory usage.", error)),
    ]);
  }

  // A missing/misconfigured NimbusPost account must not block order
  // confirmation — an admin can still book the shipment manually (or fix the
  // config and recheck) via the existing carrier/tracking fields.
  const shipment = await createNimbusShipment(env as NimbusPostEnvironment, dataKV, updated).catch((error) => {
    if (!(error instanceof NimbusPostNotConfiguredError)) {
      console.error("Could not create the NimbusPost shipment.", error);
    }
    return null;
  });
  if (shipment) {
    updated = {
      ...updated,
      status: "processing",
      trackingNumber: shipment.awbNumber,
      carrier: shipment.courierName,
      updatedAt: new Date().toISOString(),
    };
    await updateStoredOrder(ordersKV, updated);
  }

  await Promise.all([
    sendOrderConfirmedEmail(env, {
      email: order.customer.email,
      customerName: order.customer.name,
      orderId: order.id,
      items: order.items.map((item) => ({ name: item.name, qty: item.qty })),
      total: order.total,
    }).catch((error) => console.error("Could not send the order confirmation email.", error)),
    notifyAdminNewOrder(env, { orderId: order.id, customerName: order.customer.name, total: order.total }).catch((error) =>
      console.error("Could not notify admins of the new order.", error),
    ),
  ]);

  return updated;
}
