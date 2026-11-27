import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://netzwerky.pages.dev'),
  title: 'Netzwerky · Netzwerk neu Kursbuch — مع هناوي',
  applicationName: 'Netzwerky',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: 'Netzwerky', statusBarStyle: 'default' },
  description: 'Das interaktive Netzwerk-neu-Kursbuch: Buchseiten, Audio, Übungen und Fortschritt.',
  twitter: { card: 'summary_large_image', title: 'Netzwerky · Netzwerk neu Kursbuch', description: 'Buchseiten, Audio und Übungen zum Netzwerk-neu-Kursbuch.', images: ['/og.png'] },
  openGraph: {
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Netzwerky' }],
    title: 'Netzwerky · Netzwerk neu Kursbuch',
    description: 'Das interaktive Netzwerk-neu-Buch mit Audio und Übungen.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
