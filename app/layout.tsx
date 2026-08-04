import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

// Self-hosted at build time. The stylesheet used to @import these from Google
// Fonts, which is a render-blocking request to a third-party origin — the
// single most expensive thing on the page for a phone on mobile data.
// Only the weights the stylesheet actually asks for — every extra weight is
// another font file on the wire for a phone that will never render it.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Resolved from the deployment rather than hardcoded, so preview and
// production builds each advertise their own origin. Vercel injects
// VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL automatically.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Pack Style | Packaging, made unforgettable",
    template: "%s | The Pack Style",
  },
  description:
    "The Pack Style creates considered packaging, print, and brand moments for ambitious businesses across the UAE.",
  keywords: [
    "packaging company UAE",
    "box printing Dubai",
    "shopping bags UAE",
    "custom packaging",
    "printing press Dubai",
  ],
  openGraph: {
    title: "The Pack Style | Packaging, made unforgettable",
    description:
      "Premium packaging, print, and brand moments for ambitious businesses across the UAE.",
    url: siteUrl,
    siteName: "The Pack Style",
    locale: "en_AE",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // The 3D layer sits behind the copy; letting people zoom the text is the
  // accessible default and costs nothing here.
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
