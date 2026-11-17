export const ORDER_STATUSES = ["awaiting_payment", "confirmed", "processing", "shipped", "in_transit", "delivered", "canceled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// "processing" is kept as the stored value (existing orders already use it),
// but reads better to customers/admins as "Preparing".
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  processing: "Preparing",
  shipped: "Shipped",
  in_transit: "In Transit",
  delivered: "Delivered",
  canceled: "Canceled",
};
