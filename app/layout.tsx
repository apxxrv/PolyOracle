import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyOracle - AI-Powered Prediction Market Intelligence",
  description: "Real-time intelligence platform for Polymarket prediction markets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
