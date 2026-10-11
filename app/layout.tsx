import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollProgress } from "@/components/effects";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });
const display = Instrument_Serif({ subsets: ["latin"], display: "swap", variable: "--font-display", weight: "400", style: "italic" });

export const metadata: Metadata = {
  title: { default: "StatCheck — Know when your services are down", template: "%s — StatCheck" },
  description: "Monitor uptime, track incidents, and give your users a clear view of your service health with StatCheck.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} ${mono.variable} ${display.variable}`}>
      <body className="min-h-screen bg-white text-zinc-900">
        <ScrollProgress />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
