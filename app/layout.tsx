import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: 'Netzwerky · Netzwerk neu A1 — مع هناوي',
  description: 'Das interaktive Netzwerk-neu-Buch: Buchseiten, Audio, Übungen und Fortschritt.',
  openGraph: {
    title: 'Netzwerky · Netzwerk neu A1',
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
