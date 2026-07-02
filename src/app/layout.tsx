import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karmel's Garden OS",
  description: "Roots, Light & Growth for Karmel's garden stewardship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
