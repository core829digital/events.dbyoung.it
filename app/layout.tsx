import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Isola Events — Eventi premium in Toscana | Fattoria Isola",
  description:
    "Eventi firmati Dimitri Bouterline (DBYoung) o organizzati da te in Fattoria Isola, Laterina: villa seicentesca, piscina, parco e cappella. Premium, a prezzo accessibile.",
  metadataBase: new URL("https://events.dbyoung.it"),
  icons: {
    icon: "/logo/events.dbyoung.it.jpg",
    apple: "/logo/events.dbyoung.it.jpg",
  },
  openGraph: {
    title: "Isola Events · Fattoria Isola",
    description: "Jazz, blues, classica e moderna con strumenti veri — oppure la tua festa nella tenuta toscana.",
    type: "website",
    images: [{ url: "/logo/events.dbyoung.it.jpg", width: 1024, height: 1024, alt: "DBYoung Events — Fattoria Isola" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-clip bg-ink text-cream">
        <SmoothScroll />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
