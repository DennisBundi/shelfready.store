import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const siteUrl = "https://shelfready.store";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShelfReady — AI Product Photography for Online Sellers",
    template: "%s | ShelfReady",
  },
  description:
    "Upload your product photo and ShelfReady's AI places it on a model in a professional lifestyle scene — in seconds. No studio. No photographer. Join the waitlist.",
  keywords: [
    "AI product photography",
    "product photo AI",
    "ecommerce product photos",
    "AI model photography",
    "product background replacement",
    "online seller photography",
    "shopify product photos",
    "etsy product photography",
    "AI lifestyle photography",
  ],
  authors: [{ name: "ShelfReady" }],
  creator: "ShelfReady",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "ShelfReady — AI Product Photography for Online Sellers",
    description:
      "Skip the studio. Skip the photographer. Upload your product and AI generates professional lifestyle photos in seconds.",
    siteName: "ShelfReady",
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "ShelfReady — AI Product Photography" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShelfReady — AI Product Photography for Online Sellers",
    description:
      "Skip the studio. Skip the photographer. Upload your product and AI generates professional lifestyle photos in seconds.",
    creator: "@shelfready",
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geistSans.variable)}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
