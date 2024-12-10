import React from "react"
import {Providers} from "./providers"
import {Inter, JetBrains_Mono} from 'next/font/google'
import {Header} from "../components/layout/Header"
import {Footer} from "../components/layout/Footer"
import "./globals.css"

const inter = Inter({subsets: ['latin']})
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains'
})

export const metadata = {
  title: 'Logo Graveyard',
  description: 'Where rejected logos find new life',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className='dark'>
      <body className={`${inter.className} ${jetBrainsMono.variable} min-h-screen bg-background text-foreground`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}