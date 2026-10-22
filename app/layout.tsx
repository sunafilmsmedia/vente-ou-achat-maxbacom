import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Instrument_Serif, Montserrat } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";
import Clarity from "@/components/Clarity";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

// Police d'affichage lourde — titres en gros bold majuscules (branding Groupe Guillemette).
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: `${BRAND.teamName} — Devrais-tu vendre avant d'acheter ou acheter avant de vendre ?`,
  description:
    "Découvre en 60 secondes quelle stratégie immobilière pourrait être la plus avantageuse selon ta situation financière, ta propriété actuelle et ton prochain achat.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://exemple.vercel.app"),
  openGraph: {
    title: "Devrais-tu vendre avant d'acheter… ou acheter avant de vendre ?",
    description: `Stratégie immobilière personnalisée et gratuite — ${BRAND.teamName}.`,
    locale: "fr_CA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${dmSans.variable} ${instrumentSerif.variable} ${montserrat.variable}`}>
      <body className="min-h-screen antialiased">
        <MetaPixel />
        <Clarity />
        {children}
        <Script
          src="https://clarity-scanner.vercel.app/tracker.js"
          data-project={process.env.NEXT_PUBLIC_CLARITY_SCANNER_PROJECT ?? BRAND.slug}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
