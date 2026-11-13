export interface EmailEnv {
  RESEND_API_KEY?: unknown;
  RESEND_FROM_EMAIL?: unknown;
}

export async function sendEmail(
  env: EmailEnv,
  { to, subject, html, text }: { to: string; subject: string; html: string; text: string },
): Promise<{ sent: boolean }> {
  const apiKey = typeof env.RESEND_API_KEY === "string" ? env.RESEND_API_KEY : "";
  const from = typeof env.RESEND_FROM_EMAIL === "string" && env.RESEND_FROM_EMAIL ? env.RESEND_FROM_EMAIL : "HamzaOne <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured; email was not sent.", { to, subject });
    return { sent: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Resend email send failed.", res.status, body);
    return { sent: false };
  }

  return { sent: true };
}
