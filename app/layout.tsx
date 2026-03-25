import type { Metadata } from "next";
import "./globals.css";
import RootLayout from "@/components/layout/RootLayout";

export const metadata: Metadata = {
  title: "BlueHorizon - Offshore Sailing Companion",
  description: "Secure document vault, vessel intelligence, and compliance for offshore sailors",
  manifest: "/manifest.json",
  themeColor: "#1e40af",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="Your trusted offshore sailing companion" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
