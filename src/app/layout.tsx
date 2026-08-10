import type { ReactNode } from "react"
import { Providers } from "./providers"
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from 'next'
import "./globals.css"
import { ScrollManager } from '@/components/ScrollManager'


export const metadata: Metadata = {
  title: {
    default: 'Afterlife | Where rejected logos find new life',
    template: '%s | Afterlife'
  },
  description: 'Save logos, save time. Discover and acquire premium, ready-to-use logos for your brand.',
  keywords: ['logos', 'branding', 'design', 'premium logos', 'brand identity', 'rejected logos'],
  metadataBase: new URL('https://afterlife.work'),
  openGraph: {
    title: 'Afterlife | Where rejected logos find new life',
    description: 'Save LogosPage, save time. Discover and acquire premium, ready-to-use logos for your brand.',
    url: 'https://afterlife.work',
    siteName: 'Afterlife',
    images: [
      {
        url: '/open-graph-image.png',
        width: 1200,
        height: 630,
        alt: 'Afterlife Logo Collection'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afterlife | Where rejected logos find new life',
    description: 'Save LogosPage, save time. Discover and acquire premium, ready-to-use logos for your brand.',
    images: ['/open-graph-image-twitter.png'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      },
      {
        rel: 'msapplication-square144x144',
        type: 'image/png',
        url: '/windows-tile-144x144.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ScrollManager />
        <Providers>
          <Header />
          <main className="mt-[64px]">
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}