export const SUPPORT_EMAIL = "hamzaone.3d@gmail.com";

// Digits only, country code first (e.g. "91XXXXXXXXXX") — wa.me links
// require this format.
export const WHATSAPP_NUMBER: string | null = "917259665947";

export function whatsAppLink(message?: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}${query}`;
}
