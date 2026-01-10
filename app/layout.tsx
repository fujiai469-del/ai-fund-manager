import type { Metadata, Viewport } from "next";
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
  title: "AI ファンドマネージャー | 投資分析アプリ",
  description: "AIがあなたのポートフォリオを専門的に分析します。目標株価、VaR、シャープレシオなど機関投資家レベルの分析を提供。",
  keywords: ["AI", "ファンドマネージャー", "ポートフォリオ", "投資", "株式", "分析"],
  authors: [{ name: "AI Fund Manager" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI投資分析",
  },
  openGraph: {
    title: "AI ファンドマネージャー",
    description: "AIによるプロフェッショナル投資分析",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
