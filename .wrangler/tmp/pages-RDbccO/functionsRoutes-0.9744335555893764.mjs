import { onRequestPost as __api_payments_create_order_ts_onRequestPost } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\payments\\create-order.ts"
import { onRequestPost as __api_payments_verify_payment_ts_onRequestPost } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\payments\\verify-payment.ts"
import { onRequestGet as __api_orders__id__ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\orders\\[id].ts"
import { onRequestGet as __api_products__slug__ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\products\\[slug].ts"
import { onRequestGet as __api_admin_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\admin\\index.ts"
import { onRequestGet as __api_categories_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\categories\\index.ts"
import { onRequestGet as __api_custom_print_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\custom-print\\index.ts"
import { onRequestGet as __api_delivery_estimate_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\delivery-estimate\\index.ts"
import { onRequestGet as __api_home_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\home\\index.ts"
import { onRequestGet as __api_orders_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\orders\\index.ts"
import { onRequestPost as __api_orders_index_ts_onRequestPost } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\orders\\index.ts"
import { onRequestGet as __api_products_index_ts_onRequestGet } from "D:\\Sohail_Projects\\hamzaone\\functions\\api\\products\\index.ts"

export const routes = [
    {
      routePath: "/api/payments/create-order",
      mountPath: "/api/payments",
      method: "POST",
      middlewares: [],
      modules: [__api_payments_create_order_ts_onRequestPost],
    },
  {
      routePath: "/api/payments/verify-payment",
      mountPath: "/api/payments",
      method: "POST",
      middlewares: [],
      modules: [__api_payments_verify_payment_ts_onRequestPost],
    },
  {
      routePath: "/api/orders/:id",
      mountPath: "/api/orders",
      method: "GET",
      middlewares: [],
      modules: [__api_orders__id__ts_onRequestGet],
    },
  {
      routePath: "/api/products/:slug",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products__slug__ts_onRequestGet],
    },
  {
      routePath: "/api/admin",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_index_ts_onRequestGet],
    },
  {
      routePath: "/api/categories",
      mountPath: "/api/categories",
      method: "GET",
      middlewares: [],
      modules: [__api_categories_index_ts_onRequestGet],
    },
  {
      routePath: "/api/custom-print",
      mountPath: "/api/custom-print",
      method: "GET",
      middlewares: [],
      modules: [__api_custom_print_index_ts_onRequestGet],
    },
  {
      routePath: "/api/delivery-estimate",
      mountPath: "/api/delivery-estimate",
      method: "GET",
      middlewares: [],
      modules: [__api_delivery_estimate_index_ts_onRequestGet],
    },
  {
      routePath: "/api/home",
      mountPath: "/api/home",
      method: "GET",
      middlewares: [],
      modules: [__api_home_index_ts_onRequestGet],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api/orders",
      method: "GET",
      middlewares: [],
      modules: [__api_orders_index_ts_onRequestGet],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api/orders",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_index_ts_onRequestPost],
    },
  {
      routePath: "/api/products",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products_index_ts_onRequestGet],
    },
  ]