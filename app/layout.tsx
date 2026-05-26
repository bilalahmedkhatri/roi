import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/layout/LayoutClient";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ROI AI Trading | AI-Powered Trading Platform",
    template: "%s | ROI AI Trading",
  },
  description:
    "Experience AI-powered automated trading. Deposit funds, earn daily returns up to 50%, and watch your portfolio grow in real-time.",
  keywords: [
    "AI trading",
    "automated trading",
    "ROI platform",
    "crypto trading",
    "investment platform",
    "daily returns",
    "passive income",
  ],
  openGraph: {
    title: "ROI AI Trading | AI-Powered Trading Platform",
    description:
      "Experience AI-powered automated trading. Deposit, earn daily returns, and watch your portfolio grow.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROI AI Trading | AI-Powered Trading Platform",
    description:
      "Experience AI-powered automated trading. Deposit, earn daily returns, and watch your portfolio grow.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
