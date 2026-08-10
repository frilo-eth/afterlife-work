import '../globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export default function TeaserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This is a completely isolated layout that creates its own html/body structure
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 