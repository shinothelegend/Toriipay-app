import type { Metadata } from "next";
import { Shippori_Mincho, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ToriiPay -- compliant, cross-chain settlement on HashKey Chain",
  description:
    "Merchant invoicing settled through HSP, collected cross-chain via Chainlink CCIP, on HashKey Chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-stone text-ink font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
