import NextTopLoader from "nextjs-toploader";
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
  title: "NetHubz",
  description: "Platform untuk mencari semua kebutuhanmu",
  other: {
    google: "notranslate",
  },
  icons: {
    icon: '/logo.png', // Logo sebagai icon tab browser (favicon)
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en" translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#10B981" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #10B981,0 0 5px #10B981" />
        {children}
      </body>
    </html>
  );
}
