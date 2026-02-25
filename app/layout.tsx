import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F8F9FB",
};

export const metadata: Metadata = {
  title: {
    default: "kinko",
    template: "%s | kinko",
  },
  description:
    "kinko 是一個簡單、直覺的投資組合管理工具。協助您輕鬆追蹤淨值變化、管理資產配置並達成投資目標。",
  keywords: [
    "投資組合管理",
    "淨值追蹤",
    "資產配置",
    "股票投資",
    "理財工具",
    "kinko"
  ],
  authors: [{ name: "kinko Team" }],
  creator: "kinko",
  metadataBase: new URL("https://kinko-sand.vercel.app"),
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://kinko-sand.vercel.app",
    title: "kinko",
    description:
      "輕鬆追蹤全球資產，掌握每一分財富。kinko 為您提供最直覺的投資組合管理體驗。",
    siteName: "kinko",
  },
  twitter: {
    card: "summary_large_image",
    title: "kinko",
    description: "輕鬆追蹤全球資產，掌握每一分財富。",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "kinko",
    operatingSystem: "Web",
    applicationCategory: "FinanceApplication",
    description:
      "簡單、直覺的投資組合管理工具，協助您輕鬆追蹤淨值變化、管理資產配置並達成投資目標。",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TWD",
    },
  };

  return (
    <html lang="zh-Hant">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
