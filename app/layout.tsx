import type { Metadata } from "next";
import { Geist, Geist_Mono, Alegreya } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Nature's Cadence — An Interactive Visual Narrative",
  description: "A cinematic, interactive digital art piece and illustrated nature story.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${alegreya.variable} h-full antialiased bg-[#080c10]`}
    >
      <body className="min-h-full bg-[#080c10] text-[#e4e7eb] overflow-x-hidden selection:bg-slate-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
