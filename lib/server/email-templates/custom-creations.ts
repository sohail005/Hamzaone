import { sendEmail, type EmailEnv } from "@/lib/server/email";
import { isAdminEmail } from "@/lib/server/auth";
import type { CloudflareEnv } from "@/lib/server/kv";

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

export async function sendRequestReceivedEmail(env: CloudflareEnv & EmailEnv, params: { email: string; customerName: string; requestNumber: string; projectName: string }) {
  const trackUrl = `${siteUrl()}/custom-creations/track`;
  const html = baseTemplate(
    "We've received your custom creation request",
    `<p>Hi ${params.customerName},</p><p>Thanks for sharing your idea for <strong>${params.projectName}</strong>. Your request number is <strong>${params.requestNumber}</strong>. Our team will review it and send you a quotation soon.</p>`,
    trackUrl,
    "Track your request",
  );
  await sendEmail(env, {
    to: params.email,
    subject: `Request received — ${params.requestNumber}`,
    html,
    text: `We've received your custom creation request ${params.requestNumber} for ${params.projectName}. Track it at ${trackUrl}.`,
  });
}

export async function notifyAdminNewRequest(env: CloudflareEnv & EmailEnv, params: { requestNumber: string; customerName: string; projectName: string; requestId: string }) {
  const adminUrl = `${siteUrl()}/admin/custom-creations/${params.requestId}`;
  const html = baseTemplate(
    "New custom creation request",
    `<p>${params.customerName} submitted a new request: <strong>${params.projectName}</strong> (${params.requestNumber}).</p>`,
    adminUrl,
    "Review request",
  );
  await notifyAdmins(env, `New request — ${params.requestNumber}`, html, `New custom creation request ${params.requestNumber} from ${params.customerName}. Review at ${adminUrl}.`);
}

export async function sendQuotationEmail(env: CloudflareEnv & EmailEnv, params: { email: string; customerName: string; requestNumber: string; secureToken: string; finalAmount: number }) {
  const quoteUrl = `${siteUrl()}/custom-creations/quotation/${params.secureToken}`;
  const html = baseTemplate(
    "Your quotation is ready",
    `<p>Hi ${params.customerName},</p><p>We've prepared a quotation of ₹${params.finalAmount} for your request <strong>${params.requestNumber}</strong>. Review the full breakdown and let us know if you'd like to proceed.</p>`,
    quoteUrl,
    "View quotation",
  );
  await sendEmail(env, {
    to: params.email,
    subject: `Your quotation is ready — ${params.requestNumber}`,
    html,
    text: `Your quotation of ₹${params.finalAmount} for ${params.requestNumber} is ready. View it at ${quoteUrl}.`,
  });
}

export async function notifyAdminQuotationResponse(env: CloudflareEnv & EmailEnv, params: { requestNumber: string; requestId: string; accepted: boolean }) {
  const adminUrl = `${siteUrl()}/admin/custom-creations/${params.requestId}`;
  const html = baseTemplate(
    `Quotation ${params.accepted ? "accepted" : "declined"}`,
    `<p>The customer has ${params.accepted ? "accepted" : "declined"} the quotation for request <strong>${params.requestNumber}</strong>.</p>`,
    adminUrl,
    "View request",
  );
  await notifyAdmins(env, `Quotation ${params.accepted ? "accepted" : "declined"} — ${params.requestNumber}`, html, `Quotation ${params.accepted ? "accepted" : "declined"} for ${params.requestNumber}.`);
}

export async function sendPaymentConfirmedEmail(env: CloudflareEnv & EmailEnv, params: { email: string; customerName: string; requestNumber: string; orderId: string }) {
  const orderUrl = `${siteUrl()}/account/orders/${params.orderId}`;
  const html = baseTemplate(
    "Payment confirmed",
    `<p>Hi ${params.customerName},</p><p>We've received your payment for request <strong>${params.requestNumber}</strong>. Production will begin shortly.</p>`,
    orderUrl,
    "View order",
  );
  await sendEmail(env, {
    to: params.email,
    subject: `Payment confirmed — ${params.requestNumber}`,
    html,
    text: `Payment confirmed for ${params.requestNumber}. View your order at ${orderUrl}.`,
  });
}

export async function notifyAdminPaymentReceived(env: CloudflareEnv & EmailEnv, params: { requestNumber: string; requestId: string }) {
  const adminUrl = `${siteUrl()}/admin/custom-creations/${params.requestId}`;
  const html = baseTemplate("Payment received", `<p>Payment has been received for request <strong>${params.requestNumber}</strong>. It is ready for production.</p>`, adminUrl, "View request");
  await notifyAdmins(env, `Payment received — ${params.requestNumber}`, html, `Payment received for ${params.requestNumber}.`);
}

const STATUS_EMAIL_COPY: Record<string, { subject: string; title: string; body: string }> = {
  UNDER_REVIEW: { subject: "Your request is under review", title: "Your request is under review", body: "Our team is reviewing your custom creation request." },
  IN_PRODUCTION: { subject: "Production has started", title: "Production has started", body: "We've started producing your custom creation." },
  QUALITY_CHECK: { subject: "Your order is in quality check", title: "Quality check in progress", body: "Your custom creation is being quality checked before it ships." },
  READY_TO_SHIP: { subject: "Your order is ready to ship", title: "Ready to ship", body: "Your custom creation has passed quality check and is ready to ship." },
  SHIPPED: { subject: "Your order has shipped", title: "Your order has shipped", body: "Your custom creation is on its way to you." },
  COMPLETED: { subject: "Your order is complete", title: "Order complete", body: "Your custom creation has been delivered. We hope you love it!" },
  REJECTED: { subject: "Update on your request", title: "Update on your request", body: "Unfortunately we're unable to proceed with this request. Our team will reach out with details." },
  CANCELLED: { subject: "Your request has been cancelled", title: "Request cancelled", body: "Your custom creation request has been cancelled." },
};

export async function sendStatusUpdateEmail(env: CloudflareEnv & EmailEnv, params: { email: string; customerName: string; requestNumber: string; status: string }) {
  const copy = STATUS_EMAIL_COPY[params.status];
  if (!copy) return;
  const trackUrl = `${siteUrl()}/custom-creations/track`;
  const html = baseTemplate(copy.title, `<p>Hi ${params.customerName},</p><p>${copy.body} (Request ${params.requestNumber})</p>`, trackUrl, "Track your request");
  await sendEmail(env, { to: params.email, subject: `${copy.subject} — ${params.requestNumber}`, html, text: `${copy.body} Request ${params.requestNumber}.` });
}
