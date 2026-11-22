import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as HotToaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { InstallPrompt } from '@/components/pwa/install-prompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Stocky — Universal Inventory Management',
    template: '%s | Stocky',
  },
  description:
    'Universal inventory management for web, mobile, and desktop. Track products, stock movements, suppliers, and categories with real-time alerts and offline support.',
  manifest: '/manifest.json',
  authors: [{ name: 'Stocky Team' }],
  keywords: [
    'inventory',
    'inventory management',
    'stock tracking',
    'warehouse',
    'products',
    'suppliers',
    'PWA',
    'offline',
    'barcode',
    'QR code',
  ],
  creator: 'Stocky Team',
  applicationName: 'Stocky',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stocky',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Stocky',
    title: 'Stocky — Universal Inventory Management',
    description:
      'Universal inventory management for web, mobile, and desktop. Track products, stock movements, suppliers, and categories with real-time alerts and offline support.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Stocky App Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stocky — Universal Inventory Management',
    description:
      'Universal inventory management for web, mobile, and desktop with PWA support, barcode scanning, and offline mode.',
    images: ['/icon-512.png'],
    creator: '@stocky_app',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'large',
    },
  },
  verification: {
    other: {
      'apple-itunes-app': 'app-id=placeholder',
    },
  },
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Stocky',
  description:
    'Universal inventory management for web, mobile, and desktop',
  url: 'https://stocky.vercel.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D6EFD" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <link rel="icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <OfflineBanner />
            <InstallPrompt />
            {children}
            <Toaster />
            <HotToaster position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
