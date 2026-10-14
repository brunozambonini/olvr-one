import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";

const manrope = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: "OLVR ONE — Intelligence, in sight.",
  description: "A familiar shape. An entirely new perspective. Explore the design and finishes of OLVR ONE, an independent smart glasses concept.",
  openGraph: {
    title: "OLVR ONE — Intelligence, in sight.",
    description: "Explore an independent smart glasses concept. Considered design, a different perspective.",
    type: "website",
    images: [{ url: "/social-preview.jpg", width: 1200, height: 630, alt: "OLVR ONE graphite smart glasses concept in warm studio light." }],
  },
  twitter: { card: "summary_large_image", title: "OLVR ONE — Intelligence, in sight.", images: ["/social-preview.jpg"] },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={manrope.variable}><body>{children}</body></html>;
}
