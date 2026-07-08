import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karmel's Greenhouse Growth Operating System",
  description: "Karmel's greenhouse and garden stewardship, all in one place.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Karmel's GreenHouse",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#f6efdc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
