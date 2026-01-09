import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Fund Manager | Intelligent Portfolio Analysis",
  description: "AI-powered investment portfolio analyzer with market intelligence and personalized recommendations. Built with Next.js, Firebase, and Google Gemini.",
  keywords: ["AI", "fund manager", "portfolio", "investment", "stock", "analysis"],
  authors: [{ name: "AI Fund Manager" }],
  openGraph: {
    title: "AI Fund Manager",
    description: "Intelligent Portfolio Analysis powered by AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
