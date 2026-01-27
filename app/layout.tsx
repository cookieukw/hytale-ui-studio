import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DragDropPolyfill } from "@/components/drag-drop-polyfill";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hytale UI Studio — Real-Time Hytale UI Editor",
  description:
    "Create and preview Hytale UI interfaces in real time with Hytale UI Studio — a browser-based editor for Hytale modding.",
  robots: "index, follow",
  openGraph: {
    title: "Hytale UI Studio — Real-Time Hytale UI Editor",
    description:
      "Create and preview Hytale UI interfaces in real time using a modern web-based editor.",
    url: "https://hytale-ui-studio-2.vercel.app/",
    siteName: "Hytale UI Studio",
    images: [
      {
        url: "https://hytale-ui-studio-2.vercel.app/preview.png",
        width: 1200,
        height: 630,
        alt: "Hytale UI Studio Preview",
      },
    ],
    locale: "en_US",
    alternateLocale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hytale UI Studio — Real-Time Hytale UI Editor",
    description:
      "Create and preview Hytale UI interfaces directly in your browser.",
    images: ["https://hytale-ui-studio-2.vercel.app/preview.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <DragDropPolyfill />
        <Analytics />
      </body>
    </html>
  );
}
