import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import AppProviders from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s - SIU",
    default: "SIU - Đại học Quốc tế Sài Gòn",
  },
  description: "Hệ thống quản lý trường Đại học Quốc tế Sài Gòn",
  icons: {
    icon: [
      { url: '/logo-siu.webp' },
      { url: '/logo-siu.webp', sizes: '32x32', type: 'image/webp' },
      { url: '/logo-siu.webp', sizes: '16x16', type: 'image/webp' },
    ],
    shortcut: '/logo-siu.webp',
    apple: '/logo-siu.webp',
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans" suppressHydrationWarning>
        <AppProviders>
          <Suspense fallback={null}>
            {children}
            <Analytics />
          </Suspense>
        </AppProviders>
      </body>
    </html>
  )
}
