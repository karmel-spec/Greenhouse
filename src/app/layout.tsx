import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karmel's Greenhouse Growth Operating System",
  description: "Karmel's greenhouse and garden stewardship, all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
