import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: "NetHubz",
  description: "Platform untuk mencari semua kebutuhanmu",
  other: {
    google: "notranslate",
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

import SplashScreen from "@/components/SplashScreen";
import { UserProvider } from "@/contexts/UserContext";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; console.log('LOCALE IS', locale);

  // Validasi locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load messages untuk locale ini
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SplashScreen />
      <UserProvider>
        {children}
      </UserProvider>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
