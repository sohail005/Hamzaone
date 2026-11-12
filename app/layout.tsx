import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
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
