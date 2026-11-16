import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { getKV, getWorkerEnv } from "@/lib/server/kv";
import { getStoreSettings } from "@/lib/server/store-settings-store";
import "./globals.css";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function shade(hex: string, percent: number) {
  const num = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xff) * (1 + percent));
  const g = clamp(((num >> 8) & 0xff) * (1 + percent));
  const b = clamp((num & 0xff) * (1 + percent));
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function contrastColor(hex: string) {
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#FFFFFF" : "#111318";
}

async function getAccentVars(): Promise<React.CSSProperties | undefined> {
  try {
    const env = await getWorkerEnv();
    const kv = getKV(env, "DATA_KV");
    if (!kv) return undefined;
    const { accentColor } = await getStoreSettings(kv);
    if (!accentColor || !HEX_COLOR.test(accentColor)) return undefined;
    return {
      "--accent": accentColor,
      "--accent-hover": shade(accentColor, -0.15),
      "--accent-text": shade(accentColor, -0.4),
      "--accent-contrast": contrastColor(accentColor),
    } as React.CSSProperties;
  } catch {
    return undefined;
  }
}

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamzaone.pages.dev").trim().replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HamzaOne — Your Ideas. Made Real.",
    template: "%s | HamzaOne",
  },
  description: "Custom 3D printing and ready-made printed goods, made in India.",
  openGraph: {
    siteName: "HamzaOne",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HamzaOne",
  url: SITE_URL,
  logo: `${SITE_URL}/HamzaOne_Logo.webp`,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const accentVars = await getAccentVars();
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
      style={accentVars}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
