import { sendEmail, type EmailEnv } from "@/lib/server/email";
import { isAdminEmail } from "@/lib/server/auth";
import type { CloudflareEnv } from "@/lib/server/kv";
import { formatINR } from "@/lib/format";

function baseTemplate(title: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1A1C1F;">
      <div style="padding:24px 0;border-bottom:3px solid #F97316;">
        <span style="font-size:20px;font-weight:800;">Hamza<span style="color:#F97316;">One</span></span>
      </div>
      <div style="padding:24px 0;">
        <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
        <div style="font-size:15px;line-height:1.6;">${bodyHtml}</div>
        ${ctaUrl && ctaLabel ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#F97316;color:#1A1C1F;font-weight:600;border-radius:999px;text-decoration:none;">${ctaLabel}</a>` : ""}
      </div>
      <div style="padding:24px 0;border-top:1px solid #E5E5E5;color:#8A8D93;font-size:12px;">
        HamzaOne · Custom 3D Printing · hamzaone.store
      </div>
    </div>
  `;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://hamzaone.store").trim().replace(/\/$/, "");
}

async function notifyAdmins(env: CloudflareEnv & EmailEnv, subject: string, html: string, text: string) {
  const configured = typeof env.ADMIN_EMAILS === "string" ? env.ADMIN_EMAILS : "";
  const admins = configured.split(",").map((e) => e.trim()).filter(Boolean);
  await Promise.all(admins.filter((email) => isAdminEmail(env, email)).map((to) => sendEmail(env, { to, subject, html, text })));
}

export async function sendOrderConfirmedEmail(
  env: CloudflareEnv & EmailEnv,
  params: { email: string; customerName: string; orderId: string; items: Array<{ name: string; qty: number }>; total: number },
) {
  const orderUrl = `${siteUrl()}/track-order?id=${encodeURIComponent(params.orderId)}`;
  const itemsHtml = params.items.map((item) => `<li>${item.name} × ${item.qty}</li>`).join("");
  const html = baseTemplate(
    "Your order is confirmed",
    `<p>Hi ${params.customerName},</p><p>We've received your payment for order <strong>${params.orderId}</strong>. Here's what's on its way:</p><ul>${itemsHtml}</ul><p>Total paid: <strong>${formatINR(params.total)}</strong></p>`,
    orderUrl,
    "Track your order",
  );
  await sendEmail(env, {
    to: params.email,
    subject: `Order confirmed — ${params.orderId}`,
    html,
    text: `Order ${params.orderId} confirmed. Total paid: ${formatINR(params.total)}. Track it at ${orderUrl}.`,
  });
}

export async function notifyAdminNewOrder(
  env: CloudflareEnv & EmailEnv,
  params: { orderId: string; customerName: string; total: number },
) {
  const adminUrl = `${siteUrl()}/admin/orders/${params.orderId}`;
  const html = baseTemplate(
    "New paid order",
    `<p>${params.customerName} just paid for order <strong>${params.orderId}</strong> (${formatINR(params.total)}).</p>`,
    adminUrl,
    "View order",
  );
  await notifyAdmins(env, `New order — ${params.orderId}`, html, `New paid order ${params.orderId} from ${params.customerName} (${formatINR(params.total)}). View at ${adminUrl}.`);
}
